# TODO: Greatly improve to support arbitrary storage of session variables within Redis (using hashes)
# TODO: Work out how Session will interact with UserSession and Authentication

utils = require('./utils')

UserSession = require('user_session').UserSession

class exports.Session
  
  id_length: 32
  user: null
  attributes: {} # Added by Paul
  
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
          @assignUser(@data.user_id.toString()) if @data.user_id
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

  # AUTH - rip out
  assignUser: (user_id) ->
    return null unless user_id
    @user = new UserSession(user_id)
    @

  # AUTH - rip out
  save: ->
    R.hset @key(), 'user_id', @user.id if @user

  # AUTH - rip out
  loggedIn: ->
    @user?

  # AUTH - rip out
  logout: (cb) ->
    @user = null
    @create (err, new_session) -> cb(null, new_session)
