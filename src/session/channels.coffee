# Session Channels
# ----------------
# Provides an interface allowing you to subscribe or unsubscribe the session to a private channel

require('colors')

# Stores the relationship between sessionId and socketIds
subscriptions = require('../websocket/subscriptions')

module.exports = (session, socketId) ->

  # Lists all the channels the client is currently subscribed to
  list: ->
    session.channels || []

  # Subscribes the client to one or more channels
  subscribe: (names, cb = ->) ->
    session.channels = [] unless session.channels
    forceArray(names).forEach (name) ->
      unless session.channels.indexOf(name) >= 0 # clients can only join a channel once
        session.channels.push(name)
        console.log('i'.green + ' subscribed sessionId '.grey + session.id + ' to channel '.grey + name)
    @_bindToSocket()
    session.save cb
   
  # Unsubscribes the client from one or more channels
  unsubscribe: (names, cb = ->) ->
    session.channels = [] unless session.channels
    forceArray(names).forEach (name) =>
      if (i = session.channels.indexOf(name)) >= 0
        session.channels.splice(i, 1)
        subscriptions.channel.remove(name, socketId)
        console.log('i'.green + ' unsubscribed sessionId '.grey + session.id + ' from channel '.grey + name)
    session.save cb
  
  # Unsubscribes the client from all channels
  reset: (cb = ->) ->
    @unsubscribe @list(), cb
  
  _bindToSocket: ->
    session.channels = [] unless session.channels
    forceArray(session.channels).forEach (name) ->
      subscriptions.channel.add(name, socketId)


# Private

forceArray = (input) ->
  typeof(input) == 'object' && input.slice() || [input]
