# Sessions
# --------
# Creates a wrapper around a Connect Session Store object

connect = require('../connect')

channels = require('./channels')
socketIdsBy = require('../websocket/subscribe').socketIdsBy

# Define default session store
sessionStore = new connect.session.MemoryStore

# Expose options which can be changed in your app
exports.options = 
  maxAge: 2592000000 # expire session in 30 days by default

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

# Note the sessionId is the first part of the connect.sid string (before the .)
exports.findOrCreate = (sessionId, socketId, cb) ->

  sessionStore.load sessionId, (err, session) ->

    # If no session found, cb(false) so the websocket middleware can terminate the request
    return cb(false) unless session

    # Append methods
    session.channel = channels.init(session, socketId)

    session.setUserId = (userId, cb = ->) ->
      @userId = userId
      @_bindToSocket()
      @save(cb)

    session._bindToSocket = ->
      socketIdsBy.user.add(session.userId, socketId)     if session.userId?
      channels.init(session, socketId)._bindToSocket()   if session.channels? && session.channels.length > 0
      @

    session.save = (cb) ->
      sessionStore.set(sessionId, session, cb)

    # Bind username and any channel subscriptions to this socketID on each request
    session._bindToSocket()
      
    cb(session)
