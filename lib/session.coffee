# Session
# -------
# Creates and maintains a persistent session in Redis once a visitor connects over websockets

events = require('events').EventEmitter
utils = require('./utils')
pubsub = require('./pubsub.coffee')

id_length = 32
key = SS.config.redis.key_prefix
channel_separator = '¬*~'

# Process an incoming request where we have a persistent client (not the API)
exports.process = (client, cb) ->
  cookies = getCookies(client)
  if cookies && cookies.session_id && cookies.session_id.length == id_length
    SS.redis.main.hgetall "#{key}:session:#{cookies.session_id}", (err, data) ->
      if err or data == null or data == undefined
        cb(new exports.Session(client))           # session doesn't exist in Redis or is invalid
      else
        data.id = cookies.session_id
        cb(new exports.Session(client, data))     # session exists so pass through existing attrs
  else
    cb(new exports.Session(client))               # no cookie detected or invalid session id so create new session
    

# Session Class
# -------------
# A new instance of Session is created each time a websocket client connects or an API request is received
# Sessions created when using the API are not saved (at the moment)

class exports.Session extends events
  
  constructor: (@client = null, existing_attrs = null) ->
    @attributes = {}            # store a hash of serialised data in redis. e.g. {items_in_cart: 3}
    @user_id = null             # sessions start off unauthenticated by default
    @channels = []              # records pub/sub private channels the session is subscribed to
    @init()                     # passes this session instance to nested objects

    if existing_attrs
      @id = existing_attrs.id
      @created_at = existing_attrs.created_at
      @attributes = JSON.parse(existing_attrs.attributes || '{}')
      @newly_created = false
      @setUserId(existing_attrs.user_id)
      @channel.subscribe(existing_attrs.channels.split(channel_separator), true) if existing_attrs.channels
    else
      @id = utils.randomString(id_length)
      @created_at = Number(new Date)
      @newly_created = true
      @save() if @client # only save if this is a persistent (none-API) connection
  
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
  
  # Save Attributes. Groups and user_id are saved separately for speed
  save: ->
    SS.redis.main.hset @key(), 'created_at', @created_at
    SS.redis.main.hset @key(), 'attributes', JSON.stringify(@attributes)

  # Authentication. See README file for full details and examples
  authenticate: (module_name, params, cb) ->
    klass = require(module_name)
    klass.authenticate params, cb

  # Will promote the session to an Authenticated Session for the given User ID. Use after successful authentication
  setUserId: (user_id) ->
    return null unless user_id
    @user_id = user_id
    if @client
      SS.redis.main.hset @key(), 'user_id', @user_id
      SS.redis.pubsub.subscribe @user.key()
      SS.users.connected.add(@user_id, @client)
      SS.users.online.add(@user_id) if SS.config.users.online.enabled

  # Called when browser window is closed down
  _cleanup: ->
    @channels.forEach (channel) => @channel._removeClient(channel)
    

  # Authenticated Users
  user:
  
    _init: (@session) ->
    
    key: ->
      "#{key}:user:#{@session.user_id}"
    
    loggedIn: ->
      @session.user_id?
      
    logout: (cb = ->) ->
      if @session.client
        SS.redis.pubsub.unsubscribe @key()
        SS.users.connected.remove(@session.user_id)
        SS.users.online.remove(@session.user_id) if SS.config.users.online.enabled
      @session.user_id = null # clear user_id. note we are not erasing this in redis as it can be advantageous to keep this for retrospective analytics
      cb({})


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
        unless SS.internal.channels[name] and typeof(SS.internal.channels[name]) == 'object'
          SS.internal.channels[name] = []
        unless @session.channels.include(name) # clients can only join a channel once
          SS.internal.channels[name].push(@session.client)
          @session.channels.push(name)
          SS.log.pubsub.channels.subscribe(@session.user_id, name)         
      @_save() unless resubscribe
      true

    # Unsubscribes the client from one or more channels
    unsubscribe: (names) ->
      forceArray(names).forEach (name) =>
        if @session.channels.include(name)
          @_removeClient(name)
          @session.channels = @session.channels.delete(name)
          SS.log.pubsub.channels.unsubscribe(@session.user_id, name)
          true
        else
          false
        @_save()
    
    # Updates client's channel subscriptions in Redis so they can be re-invoked if the page is reloaded
    _save: ->
      SS.redis.main.hset @session.key(), 'channels', @session.channels.join(channel_separator)

    # Removes the client from the list of clients to message in that channel
    _removeClient: (name) ->
      SS.internal.channels[name] = SS.internal.channels[name].delete(@session.client)
      delete SS.internal.channels[name] if SS.internal.channels[name].length == 0


# PRIVATE

forceArray = (input) ->
  input = [input] unless typeof(input) == 'object'
  input

getCookies = (client) ->
  try
    utils.parseCookie(client.request.headers.cookie)
  catch e
    {}
