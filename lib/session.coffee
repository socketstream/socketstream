utils = require('./utils')

class exports.Session
  
  id_length: 32
  user: null
  
  constructor: (@client) ->
    @cookies = try
      utils.parseCookie(@client.request.headers.cookie)
    catch e
      {}
  
  key: ->
    "session:#{@id}"

  process: (cb) ->
    if @cookies && @cookies.session_id && @cookies.session_id.length == @id_length
      R.hgetall 'session:' + @cookies.session_id, (err, @data) =>
        if err or @data == null
          @create(cb)
        else
          @id = @cookies.session_id
          @assignUser @data
          cb(null, @)
    else
      @create(cb)

  create: (cb) ->
    @id = utils.randomString(@id_length)
    @data = {}
    @data.created_at = Number(new Date())
    R.hset @key(), 'created_at', @data.created_at, (err, response) =>
      @newly_created = true
      cb(err, @)      

  # Authentication is provided by passing the name of a module which Node must be able to load, either from /lib/server, /vendor/module/lib, or from npm.
  # The module must implement an 'authenticate' function which expects a params object normally in the form of username and password, but could also be biometric or iPhone device id, SSO token, etc.
  #
  # The callback must be an object with a 'status' attribute (boolean) and an 'id' attribute (number or string) if successful.
  #
  # Additional info, such as number of tries remaining etc, can be passed back within the object and pushed upstream to the client. E.g:
  #
  # {success: true, id: 21323, info: {username: 'joebloggs'}}
  # {success: false, info: {num_retries: 2}}
  # {success: false, info: {num_retries: 0, lockout_duration_mins: 30}}
  authenticate: (module_name, params, cb) ->
    klass = require(module_name).Authentication
    auth = new klass
    auth.authenticate params, cb

  # Users
  assignUser: (data) ->
    return null unless data.user_id
    @user = @_encodeAttributes data.attributes  

  loggedIn: ->
    @user?
  
  logout: (cb) ->
    @user = null
    @create (err, new_session) -> cb(null, new_session)    
  
  setUserAndAttributes: (id, user_data) ->
    return null if id is undefined or user_data is undefined
    R.hset @key(), 'user_id', id
    @assignUser(user_data)    
    R.hset @key(), 'attributes', @_decodeAttributes Object.extend @getAttributes(), user_data # Set attributes    
    
  getAttributes: ->
    attr = R.hget @key(), 'attributes'
    @_encodeAttributes if attr is undefined then '{}' else attr
    
  # Encode a hash to a string for storing in Redis. This should be deprecated once Redis 2.2 is in use.  
  _encodeAttributes: (attr) ->
    JSON.parse attr

  # Decode a string from Redis into a hash. This should be deprecated once Redis 2.2 is in use.    
  _decodeAttributes: (attr) ->
    JSON.stringify attr