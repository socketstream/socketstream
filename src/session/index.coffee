# Sessions
# --------
# Creates a wrapper around a Connect Session Store object

connect = require('connect')

channels = require('./channels')
subscriptions = require('../websocket/subscriptions')

# Define default session store
sessionStore = new connect.session.MemoryStore

# Expose options which can be changed in your app
exports.options = 
  maxAge: null # by default session exists for duration of user agent (e.g. until browser is closed)

# Allow use of any Connect Session Store
exports.store =

  use: (nameOrStore, options) ->
    sessionStore = if nameOrStore == 'redis'
      RedisStore = require('connect-redis')(connect)
      new RedisStore(options)
    else
      # Allow any Connect Session Store *instance* to be used
      nameOrStore
  
  get: ->
    sessionStore

# Manually create a new session (for running server-side tests, or calling responders from ss-console)
exports.create = ->
  Session = connect.session.Session
  sessionID = connect.utils.uid(24)

  thisSession = new Session({sessionID: sessionID, sessionStore: sessionStore})
  thisSession.cookie = {maxAge: null}
  thisSession.save()
  sessionID

# Find a session from the Connect Session Store
# Note: Sessions are automatically created by the connect.session()
# middlware when the browser makes a HTTP request
exports.find = (sessionId, socketId, cb) ->

  sessionStore.load sessionId, (err, session) ->

    # If no session found, cb(false) so the websocket middleware can terminate the request
    return cb(false) unless session

    # Append methods
    session.channel = channels(session, socketId)

    session.setUserId = (userId, cb = ->) ->
      @userId = userId
      @_bindToSocket()
      @save(cb)

    session._bindToSocket = ->
      subscriptions.user.add(session.userId, socketId)  if session.userId?
      session.channel._bindToSocket()                 if session.channels? && session.channels.length > 0
      @

    session.save = (cb) ->
      sessionStore.set(sessionId, session, cb)

    # Bind username and any channel subscriptions to this socketID on each request
    session._bindToSocket()
      
    cb(session)
