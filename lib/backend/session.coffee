# Session
# -------
# Creates and maintains a persistent session in Redis once a visitor connects over websockets
# The goal here is to ensure pressing refresh on the page, accidently or otherwise, keeps you in the same session - regardless of which server you connect to

EventEmitter = require('events').EventEmitter
util = require('util')
utils = require('./../utils')

# Set constants
id_length = 32
key = SS.config.redis.key_prefix
channel_separator = '¬*~'

# Session Class
# -------------
# A new instance of Session is created each time a websocket client connects or an API request is received
# Sessions created when using the API are not saved (at the moment)

class exports.Session extends EventEmitter
  
  # Note: A unique @id will only be passed if the request originates over websockets
  constructor: (@id = null) ->
    @attributes = {}            # store a hash of serialised data in redis. e.g. {items_in_cart: 3}
    @user_id = null             # sessions start off unauthenticated by default
    @channels = []              # records pub/sub private channels the session is subscribed to
    @init()                     # passes this session instance to nested objects
    @

  #### Methods beginning _ should only be used internally

  # If we've already found it in Redis    
  _findOrCreate: (cb) ->
    if isValidId(@id)
      # Let's see if we've already seen this visitor in Redis
      SS.redis.main.hgetall @key(), (err, data) =>
        if err or data == null or data == undefined
          @_createNew()             # session doesn't exist in Redis or is invalid
          cb @
        else
          @_fromExisting(data)      # session exists so pass through attributes
          cb @
    else
      @_createNew()
      cb @

  _fromExisting: (data) ->
    @created_at = data.created_at
    @attributes = JSON.parse(data.attributes || '{}')
    @newly_created = false
    @setUserId(data.user_id) if data.user_id
    @channel.subscribe(data.channels.split(channel_separator), true) if data.channels
  
  # Create a brand new session
  _createNew: ->
    @created_at = Number(new Date())
    @newly_created = true
    SS.redis.main.hset(@key(), 'created_at', @created_at) if @id # only save if this is a persistent (none-API) connection
  
  # Get load the bare minimum from Redis (useful for heartbeats, disconnects etc)
  getUserId: (cb) ->
    return cb(@user_id) if @user_id
    SS.redis.main.hget @key(), 'user_id', (err, user_id) ->
      @user_id = user_id
      cb(@user_id)


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
  save: ->
    SS.redis.main.hset @key(), 'attributes', JSON.stringify(@attributes)

  # Authentication. See README file for full details and examples
  authenticate: (module_name, params, cb) ->
    klass = require(module_name)
    klass.authenticate params, cb

  # Will promote the session to an Authenticated Session for the given User ID. Use after successful authentication
  setUserId: (user_id) ->
    return null unless user_id
    @user_id = user_id
    if @id
      SS.redis.main.hset @key(), 'user_id', @user_id
      SS.publish._system {command: 'user_authenticated', user_id: @user_id, session_id: @id}
      SS.users.online.add(@user_id) if SS.config.users.online.enabled
    

  # Authenticated Users
  user:
  
    _init: (@session) ->
    
    key: ->
      "#{key}:user:#{@session.user_id}"
    
    loggedIn: ->
      @session.user_id is not null
      
    logout: (cb = ->) ->
      SS.users.online.remove(@session.user_id) if SS.config.users.online.enabled
      SS.redis.main.hset @session.key(), 'previous_user_id', @session.user_id # for retrospective log analysis
      SS.publish._system {command: 'user_logout', user_id: @session.user_id, session_id: @session.id}
      @session.user_id = null
      SS.redis.main.hdel @session.key(), 'user_id', -> cb true


  # Pub/Sub Private Channels
  channel:
  
    _init: (@session) ->
  
    # Lists all the channels the client is currently subscribed to
    list: ->
      @session.channels

    # Subscribes the client to one or more channels
    subscribe: (names, resubscribe = false) ->
      forceArray(names).forEach (name) =>
        throw new Error("Sorry, channel names cannot contain #{channel_separator} as this is used as a separator") if name.contains(channel_separator)
        unless @session.channels.include(name) # clients can only join a channel once
          @session.channels.push(name)
          SS.publish._system {command: 'channel_subscribe', name: name, session_id: @session.id}
          SS.log.pubsub.channels.subscribe(@session.user_id, name)         
      @_save() unless resubscribe
      true

    # Unsubscribes the client from one or more channels
    unsubscribe: (names) ->
      forceArray(names).forEach (name) =>
        if @session.channels.include(name)
          @session.channels = @session.channels.delete(name)
          SS.publish._system {command: 'channel_unsubscribe', name: name, session_id: @session.id}
          SS.log.pubsub.channels.unsubscribe(@session.user_id, name)
          true
        else
          false
        @_save()
    
    # Unsubscribes the client from all channels
    unsubscribeAll: ->
      @unsubscribe @session.channels
    
    # Updates client's channel subscriptions in Redis so they can be re-invoked if the page is reloaded
    _save: ->
      SS.redis.main.hset @session.key(), 'channels', @session.channels.join(channel_separator)


# PRIVATE HELPERS

isValidId = (session_id) ->
  session_id and session_id.length == id_length

forceArray = (input) ->
  input = [input] unless typeof(input) == 'object'
  input

