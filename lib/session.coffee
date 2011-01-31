utils = require('./utils')

class exports.Session

  id_length: 32  
  newly_created: false
  attributes: {}          # store a hash of serialised data in redis. e.g. {items_in_cart: 3}
  user_id: null           # null when no user logged in
  user: null              # attach an instance of your custom application User code here
  
  constructor: (@client) ->
    @cookies = try
      utils.parseCookie(@client.request.headers.cookie)
    catch e
      {}
  
  key: ->
    "socketstream:session:#{@id}"
    
  pubsub_key: ->
    "socketstream:user:#{@id}"

  process: (cb) ->
    if @cookies && @cookies.session_id && @cookies.session_id.length == @id_length
      R.hgetall "socketstream:session:#{@cookies.session_id}", (err, data) =>
        if err or data == null or data == undefined
          @create(cb)
        else
          @id = @cookies.session_id
          @attributes = JSON.parse(data.attributes || '{}')
          @setUserId(data.user_id)
          cb(@)
    else
      @create(cb)

  create: (cb) ->
    @id = utils.randomString(@id_length)
    @created_at = Number(new Date())
    R.hset @key(), 'created_at', @created_at, (err, response) =>
      @newly_created = true
      cb(@)      

  # Authentication is provided by passing the name of a module which Node must be able to load, either from /lib/server, /vendor/module/lib, or from npm.
  # The module must implement an 'authenticate' function which expects a params object normally in the form of username and password, but could also be biometric or iPhone device id, SSO token, etc.
  #
  # The callback must be an object with a 'status' attribute (boolean) and a 'user_id' attribute (number or string) if successful.
  #
  # Additional info, such as number of tries remaining etc, can be passed back within the object and pushed upstream to the client. E.g:
  #
  # {success: true, user_id: 21323, info: {username: 'joebloggs'}}
  # {success: false, info: {num_retries: 2}}
  # {success: false, info: {num_retries: 0, lockout_duration_mins: 30}}
  authenticate: (module_name, params, cb) ->
    klass = require(module_name).Authentication
    auth = new klass
    auth.authenticate params, cb

  # Users
  setUserId: (user_id) ->
    return null unless user_id
    @user_id = user_id
    R.hset @key(), 'user_id', @user_id
    RPS.subscribe @pubsub_key()
    $SS.connected_users[@id] = @client
    
  logout: (cb) ->
    @user_id = null  # clear user_id. note we are not erasing this in redis as it can be advantagous to keep this for retrospective analytics
    @user = null     # clear any attached custom User instance
    RPS.unsubscribe @pubsub_key()
    delete $SS.connected_users[@id]
    @create (err, new_session) -> cb(new_session)

  loggedIn: ->
    @user_id?

  save: ->
    R.hset @key(), 'attributes', JSON.stringify(@attributes)
    

