# Websocket Event Dispatcher
# --------------------------
# Delivers events to individual (or groups of) websocket IDs 

subscriptions = require('./subscriptions')

module.exports = (eventTransport, wsTransport, emitter) ->

  eventTransport.listen (obj) ->

    send = wsTransport.event()

    cb = switch obj.t
      when 'all'
        (msg) -> send.all(msg)
      when 'socketId'
        (msg) -> send.socketId(obj.socketId, msg)
      when 'channel'
        (msg) -> sendToMultiple(send, msg, obj.channels, 'channel')
      when 'user'
        (msg) -> sendToMultiple(send, msg, obj.users, 'user')

    # Emit message to the event responder (always Responder ID 0)
    emitter.emit('0', obj, {}, cb)


# Private

# Attempt to send the event to the socket. If socket no longer exists, remove it from set
sendToMultiple = (send, msg, destinations, type) ->
  destinations = destinations instanceof Array && destinations || [destinations]
  destinations.forEach (destination) ->
    set = subscriptions[type]
    if socketIds = set.members(destination)
      socketIds.slice(0).forEach (socketId) ->
        set.removeFromAll(socketId) unless send.socketId(socketId, msg, destination)
  true