# Sessions
# --------
# There is so much work still to do in this area!!

channels = require('./channels')
socketIdsBy = require('../websocket/subscribe').socketIdsBy

exports.store = require('./store')
Store = exports.store.Store

cache = {}

exports.findOrCreate = (sessionId, socketId, cb) ->

  # Look for the session in the local in-memory cache first
  # Note the cache is always empty for now to prevent memory leaks
  # because cache eviction is not implemented yet

  if store = cache[sessionId]
    cb session(store, socketId)._bindToSocket()
  
  # Else try to find it in the store
  else
    exports.store.lookup sessionId, (storeSession) ->
      store = new Store(sessionId)
      if storeSession
        store.userId = storeSession.userId
        store.channels = storeSession.channels
      cb session(store, socketId)._bindToSocket()

# This is the session object appended to the request when you call the m.loadSession() middleware
session = (store, socketId) ->

  # Return API
  userId: store.userId

  channel: channels.init(store, socketId)

  setUserId: (userId, cb = ->) ->
    store.userId = userId
    @_bindToSocket()
    store.save(cb)


  # Private function (do not use in your app)

  _store: store

  _bindToSocket: ->
    socketIdsBy.user.add(store.userId, socketId)     if store.userId?
    channels.init(store, socketId)._bindToSocket()   if store.channels? && store.channels.length > 0
    @


