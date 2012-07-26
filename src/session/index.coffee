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
  sessionId = connect.utils.uid(24)
  create(sessionId)
  sessionId
  

# Find a session from the Connect Session Store
# Note: Sessions are automatically created by the connect.session()
# middleware when the browser makes a HTTP request
exports.find = (sessionId, socketId, cb) ->

  sessionStore.load sessionId, (err, session) ->

    # Create a new session if we don't have this sessionId in memory
    # Note: in production you should be using Redis or another
    # persistent store so this should rarely happen
    session = create(sessionId) unless session

    # Append methods to session object
    session.channel = channels(session, socketId)

    session.setUserId = (userId, cb = ->) ->
      if userId
        @userId = userId
        @_bindToSocket()
      else if @userId # if null (i.e. user has signed out)
        subscriptions.user.remove(@userId, socketId)
        delete @userId
      @save(cb)

    session._bindToSocket = ->
      subscriptions.user.add(session.userId, socketId)  if session.userId?
      session.channel._bindToSocket()                   if session.channels? && session.channels.length > 0
      @

    session.save = (cb) ->
      sessionStore.set(sessionId, session, cb)

    # Bind username and any channel subscriptions to this socketID on each request
    session._bindToSocket()
      
    cb(session)


# PRIVATE

create = (sessionId) ->
  session = new connect.session.Session({sessionID: sessionId, sessionStore: sessionStore})
  session.cookie = {maxAge: exports.options.maxAge}
  session.save()
  session
