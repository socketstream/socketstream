# Session
# -------
# Creates and maintains a persistent session once a visitor connects over websockets
# Session data is also synched / cached on the front end server the client is connected to and sent along with every RPC request to avoid callbacks and constantly hammering the session store (e.g. Redis)
# The goal here is to ensure pressing refresh on the page, accidentally or otherwise, keeps you in the same session - regardless of which front server you connect to

EventEmitter = require('events').EventEmitter
util = require('util')
utils = require('./../utils')

# Store session information internally if Redis is not present
# Note internal store is for development/experimentation only, not production use
store_name = SS.redis && 'redis' || 'internal'
store = require("./session_storage/#{store_name}.coffee")

# Set constants
fields_to_store = ['id','user_id','channels','attributes']

# When something happens to a session (e.g. a user subscribes to a new channel), the front end server
# needs to be notified. Events are queued here in the right order, and sent back to the front end server
# on the very next request; regardless whether or not that request modifies the session object.
# We will dispense with the enforced RPC layer concept in 0.3. Until then this should prove to be a
# better solution under load. Any improvements in this area greatly received.
exports.updates =
  
  _buffer: {}

  add: (id, field, value) ->
    @_buffer[id] = [] unless @_buffer[id]? && typeof(@_buffer[id]) == 'object'
    update = {field: field, value: value}
    @_buffer[id].push(update)
  
  purge: (id) ->
    out = @_buffer[id]? && @_buffer[id] || []
    delete @_buffer[id]
    out


# Session Class
# -------------
# A new instance of Session is created each time a websocket client connects or an API request is received
# Sessions created when using the API are not saved (at the moment)

class exports.Session extends EventEmitter

  # Note: A unique @id will only be passed if the request originates over websockets
  constructor: (cachedData = {}) ->
    @attributes = {}        # store a hash of custom session data. e.g. {items_in_cart: 3}
    @user_id = null         # sessions start off unauthenticated by default
    @channels = []          # records pub/sub private channels the session is subscribed to
    @init()                 # passes this session instance to nested objects
    @_copyFrom(cachedData)  # sent as part of the RPC request from the front end. Avoids Redis lookups if no data changes
    @

  #### Methods beginning _ should only be used internally

  # Load an existing session or store a new one
  _findOrCreate: (cb) ->
    @_loadFromStore (sessionExists) =>
      @_createNew() unless sessionExists?
      cb @

  # Data this session needs to store. Doing it this way to reduce bytes we're storing on the front end and passing over the wire
  _data: ->
    out = {}
    fields_to_store.forEach (field) => out[field] = @[field]
    out
  
  # Get the latest data from the session store
  _loadFromStore: (cb) ->
    return cb(false) unless isValidId(@id)
    store.getAll @id, (data) =>
      cb data && @_copyFrom(data)

  # Create a brand new session
  _createNew: ->
    @newly_created = true
    @created_at = Number(new Date())
    store.set(@id, 'created_at', @created_at) if @id # only save if this is a persistent (none-API) connection
    @

  # Copy data from an object into this instance
  _copyFrom: (data) ->
    fields_to_store.forEach (field) =>
      if data[field]?
        # as we're going to be looking for differences we can't copy arrays, must clone
        @[field] = if @[field]? && typeof(@[field]) == 'object' && @[field].length != undefined
          data[field].slice(0)
        else
          data[field]
    true

  # Update a value in the store and queue the change to be reflected in the frontend cache
  _update: (field, value, cb) ->
    value = value.slice(0) if value? && typeof(value) == 'object' && @[field].length != undefined
    exports.updates.add @id, field, value
    value? && store.set(@id, field, value, cb) || store.delete(@id, field, cb)



  #### Public methods
  
  # This method is called both by the constructor and each time an incoming websocket call is processed
  # It enables the nested namespaces ('user' and 'group') to access the current session object instead of the last one initialized by the constructor
  # For now this seems to be the best way to allow namespacing without storing separate copies the objects for each Session
  # Hopefully we will find a nicer way to do this in the future!
  init: ->
    @user._init(@)
    @channel._init(@)
  
  # Save Attributes
  save: (cb = ->) ->
    return cb(false) unless @id
    @_update 'attributes', @attributes, cb

  # Authentication. See doc file for full details and examples
  authenticate: (module_name, params, cb) ->
    klass = require(module_name)
    klass.authenticate params, cb

  # Will promote the session to an Authenticated Session for the given User ID. Use after successful authentication
  setUserId: (user_id, cb = ->) ->
    return false unless user_id
    @user_id = user_id
    if @id
      SS.users.online && SS.users.online.add(@user_id)
      @_update 'user_id', @user_id, cb
    

  # Authenticated Users
  user:
  
    _init: (@session) ->
    
    key: ->
      "#{key}:user:#{@session.user_id}"
    
    loggedIn: ->
      @session.user_id?
      
    logout: (cb = ->) ->
      SS.users.online && SS.users.online.remove(@session.user_id)
      store.set @session.id, 'previous_user_id', @session.user_id # for retrospective log analysis
      @session.user_id = null
      @session._update 'user_id', @session.user_id, cb


  # Pub/Sub Private Channels
  channel:

    _init: (@session) ->

    # Lists all the channels the client is currently subscribed to
    list: (cb) ->
      throw new Error('@session.channel.list now requires a callback!') unless cb
      @session._loadFromStore =>
        cb @session.channels

    # Subscribes the client to one or more channels
    subscribe: (names, cb = ->) ->
      @session._loadFromStore =>
        forceArray(names).forEach (name) =>
          unless @session.channels.include(name) # clients can only join a channel once
            @session.channels.push(name)
            SS.log.pubsub.channels.subscribe @session.user_id, name
            SS.events.emit 'channel:subscribe', @session, name
        @session._update 'channels', @session.channels, cb

    # Unsubscribes the client from one or more channels
    unsubscribe: (names, cb = ->) ->
      @session._loadFromStore =>
        forceArray(names).forEach (name) =>
          if @session.channels.include(name)
            @session.channels = @session.channels.delete(name)
            SS.log.pubsub.channels.unsubscribe(@session.user_id, name)
            SS.events.emit 'channel:unsubscribe', @session, name
        @session._update 'channels', @session.channels, cb

    # Unsubscribes the client from all channels
    unsubscribeAll: (cb = ->) ->
      @list (channels) =>
        @unsubscribe channels, cb
    


# PRIVATE HELPERS

isValidId = (session_id) ->
  session_id and session_id.length == 32

forceArray = (input) ->
  typeof(input) == 'object' && input || [input]
