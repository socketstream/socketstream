# Session
# -------
# Creates and maintains a persistent session in Redis once a visitor connects over websockets
# Session data is also synched / cached on the front end server the client is connected to and sent along with every RPC request to avoid callbacks and constantly hammering Redis
# The goal here is to ensure pressing refresh on the page, accidentally or otherwise, keeps you in the same session - regardless of which front server you connect to

EventEmitter = require('events').EventEmitter
util = require('util')
utils = require('./../utils')

# Set constants
id_length = 32
key = SS.config.redis.key_prefix
fields_to_store = ['id','user_id','channels','attributes']


# Session Class
# -------------
# A new instance of Session is created each time a websocket client connects or an API request is received
# Sessions created when using the API are not saved (at the moment)

class exports.Session extends EventEmitter

  # Note: A unique @id will only be passed if the request originates over websockets
  constructor: (data = {}) ->
    @attributes = {}            # store a hash of serialised data in redis. e.g. {items_in_cart: 3}
    @user_id = null             # sessions start off unauthenticated by default
    @channels = []              # records pub/sub private channels the session is subscribed to
    @init()                     # passes this session instance to nested objects
    
    # Copy existing data into this instance
    fields_to_store.forEach (field) =>
      if data[field]?
        # as we're going to be looking for differences we can't copy arrays, must clone
        @[field] = if @[field]? && typeof(@[field]) == 'object' && @[field].length != undefined
          data[field].slice(0)
        else
          data[field]
    
    # Return instance
    @

  #### Methods beginning _ should only be used internally

  # Load an existing session or store a new one in Redis
  _findOrCreate: (cb) ->
    if isValidId(@id)
      # Let's see if we've already seen this visitor in Redis
      SS.redis.main.hgetall @key(), (err, data) =>
        if err or !data or !data.created_at
          cb @_createNew()             # session doesn't exist in Redis or is invalid
        else
          cb @_fromExisting(data)      # session exists so pass through attributes
    else
      cb @_createNew()

  # Data this session needs to store. Doing it this way to reduce bytes we're storing on the front end and passing over the wire
  _data: ->
    out = {id: @id}
    @user_id          && out.user_id = @user_id
    @channels.any()   && out.channels = @channels
    @attributes.any() && out.attributes = @attributes
    out

  # Output only the differences between the original and current session values
  # The deltas are sent back to the front end server so the socket.ss.session object can be updated
  _updates: (original) ->
    updated = false
    out = {}
    fields_to_store.forEach (field) =>
      if original[field] != @[field]
        updated = true
        out[field] = @[field] 
    updated && out || undefined

  # Populate session data the hash out of Redis
  _fromExisting: (data) ->
    @newly_created = false
    @created_at = data.created_at
    @user_id = data.user_id
    @attributes = JSON.parse(data.attributes || '{}')
    @channels = JSON.parse(data.channels) if data.channels
    @

  # Create a brand new session
  _createNew: ->
    @newly_created = true
    @created_at = Number(new Date())
    SS.redis.main.hset(@key(), 'created_at', @created_at) if @id # only save if this is a persistent (none-API) connection
    @


  #### Public methods
  
  # This method is called both by the constructor and each time an incoming websocket call is processed
  # It enables the nested namespaces ('user' and 'group') to access the current session object instead of the last one initialized by the constructor
  # For now this seems to be the best way to allow namespacing without storing separate copies the objects for each Session
  # Hopefully we will find a nicer way to do this in the future!
  init: ->
    @user._init(@)
    @channel._init(@)
  
  # The Session Key in Redis
  key: ->
    "#{key}:session:#{@id}"
  
  # Save Attributes
  save: (cb = ->) ->
    return cb(false) unless @id
    SS.redis.main.hset @key(), 'attributes', JSON.stringify(@attributes), -> cb(true)

  # Authentication. See README file for full details and examples
  authenticate: (module_name, params, cb) ->
    klass = require(module_name)
    klass.authenticate params, cb

  # Will promote the session to an Authenticated Session for the given User ID. Use after successful authentication
  setUserId: (user_id, cb = ->) ->
    return false unless user_id
    @user_id = user_id
    if @id
      SS.users.online.add(@user_id) if SS.config.users_online.enabled
      SS.redis.main.hset @key(), 'user_id', @user_id, -> cb(true)
    

  # Authenticated Users
  user:
  
    _init: (@session) ->
    
    key: ->
      "#{key}:user:#{@session.user_id}"
    
    loggedIn: ->
      @session.user_id?
      
    logout: (cb = ->) ->
      SS.users.online.remove(@session.user_id) if SS.config.users_online.enabled
      SS.redis.main.hset @session.key(), 'previous_user_id', @session.user_id # for retrospective log analysis
      @session.user_id = null
      SS.redis.main.hdel @session.key(), 'user_id', -> cb(true)


  # Pub/Sub Private Channels
  channel:
  
    _init: (@session) ->
  
    # Lists all the channels the client is currently subscribed to
    list: ->
      @session.channels

    # Subscribes the client to one or more channels
    subscribe: (names, cb = ->) ->
      forceArray(names).forEach (name) =>
        unless @session.channels.include(name) # clients can only join a channel once
          @session.channels.push(name)
          SS.log.pubsub.channels.subscribe @session.user_id, name
          SS.events.emit 'channel:subscribe', @session, name
      @_save cb
     
    # Unsubscribes the client from one or more channels
    unsubscribe: (names, cb = ->) ->
      forceArray(names).forEach (name) =>
        if @session.channels.include(name)
          @session.channels = @session.channels.delete(name)
          SS.log.pubsub.channels.unsubscribe(@session.user_id, name)
          SS.events.emit 'channel:unsubscribe', @session, name
      @_save cb
    
    # Unsubscribes the client from all channels
    unsubscribeAll: (cb = ->) ->
      @unsubscribe @list(), cb
    
    # Updates client's channel subscriptions in Redis so they can be re-invoked if the page is reloaded
    _save: (cb) ->
      SS.redis.main.hset @session.key(), 'channels', JSON.stringify(@session.channels), -> cb(true)


# PRIVATE HELPERS

isValidId = (session_id) ->
  session_id and session_id.length == id_length

forceArray = (input) ->
  typeof(input) == 'object' && input || [input]
