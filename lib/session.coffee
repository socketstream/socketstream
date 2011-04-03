# Session
# -------
# Creates and maintains a persistent session in Redis once a visitor connects over websockets

utils = require('./utils')

id_length = 32
key = $SS.config.redis.key_prefix

# Process an incoming request where we have a persistent client (not the API)
exports.process = (client, cb) ->
  cookies = getCookies(client)
  if cookies && cookies.session_id && cookies.session_id.length == id_length
    $SS.redis.main.hgetall "#{key}:session:#{cookies.session_id}", (err, data) ->
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

class exports.Session

  newly_created: true
  attributes: {}          # store a hash of serialised data in redis. e.g. {items_in_cart: 3}
  user_id: null           # null when no user logged in
  user: null              # attach an instance of your custom application User code here
  
  constructor: (@client = null, existing_attrs = null) ->
    if existing_attrs
      @id = existing_attrs.id
      @created_at = existing_attrs.created_at
      @attributes = JSON.parse(existing_attrs.attributes || '{}')
      @newly_created = false
      @setUserId(existing_attrs.user_id)
    else
      @id = utils.randomString(id_length)
      @created_at = Number(new Date)
      @save() if @client # only save if this is a persistent (none-API) connection
  
  key: ->
    "#{key}:session:#{@id}"
    
  pubsub_key: ->
    "#{key}:user:#{@user_id}"

  # Authentication. See README file for full details and examples
  authenticate: (module_name, params, cb) ->
    klass = require(module_name)
    klass.authenticate params, cb

  # Users
  setUserId: (user_id) ->
    return null unless user_id
    @user_id = user_id
    if @client
      $SS.redis.main.hset @key(), 'user_id', @user_id
      $SS.redis.pubsub.subscribe @pubsub_key()
      $SS.users.connected[@user_id] = @client
      $SS.users.online.add(@user_id) if $SS.config.users.online.enabled

  logout: (cb) ->
    if @client
      $SS.redis.pubsub.unsubscribe @pubsub_key()
      delete $SS.users.connected[@user_id]
      $SS.users.online.remove(@user_id) if $SS.config.users.online.enabled
    @user_id = null  # clear user_id. note we are not erasing this in redis as it can be advantageous to keep this for retrospective analytics
    @user = null     # clear any attached custom User instance
    cb({})

  loggedIn: ->
    @user_id?

  save: ->
    $SS.redis.main.hset @key(), 'created_at', @created_at
    $SS.redis.main.hset @key(), 'attributes', JSON.stringify(@attributes)


# PRIVATE

getCookies = (client) ->
  try
    utils.parseCookie(client.request.headers.cookie)
  catch e
    {}
