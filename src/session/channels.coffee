# Session Channels
# ----------------
# Provides an interface allowing you to subscribe or unsubscribe the session to a private channel

require('colors')

# Stores the relationship between sessionId and socketIds
socketIdsBy = require('../websocket/subscribe').socketIdsBy

exports.init = (store, socketId) ->

  # Lists all the channels the client is currently subscribed to
  list: ->
    store.channels

  # Subscribes the client to one or more channels
  subscribe: (names, cb = ->) ->
    forceArray(names).forEach (name) ->
      unless store.channels.indexOf(name) >= 0 # clients can only join a channel once
        store.channels.push(name)
        console.log 'i'.cyan, 'subscribing session id', store.id, 'socket id', socketId, 'to', name
    @_bindToSocket()
    store.save cb
   
  # Unsubscribes the client from one or more channels
  unsubscribe: (names, cb = ->) ->
    forceArray(names).forEach (name) =>
      if (i = store.channels.indexOf(name)) >= 0
        store.channels.splice(i, 1)
        socketIdsBy.channel.remove(name, socketId)
    store.save cb
  
  # Unsubscribes the client from all channels
  reset: (cb = ->) ->
    @unsubscribe @list(), cb
  
  _bindToSocket: ->
    forceArray(store.channels).forEach (name) ->
      socketIdsBy.channel.add(name, socketId)


# Private

forceArray = (input) ->
  typeof(input) == 'object' && input || [input]
