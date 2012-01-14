# PubSub Event Subscriber
# -----------------------
# Stores a list of which socket IDs are subscribed to which users or channels
# and delivers events accordingly

UniqueSet = require('../../utils/unique_set').UniqueSet

exports.socketIdsBy = 
  user:     new UniqueSet
  channel:  new UniqueSet

exports.init = (eventTransport, wsTransport, emitter) ->

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

    # Emit message to the event responder
    emitter.emit 'event', obj, cb


# Private

# Attempt to send the event to the socket. If socket no longer exists, remove it from set
sendToMultiple = (send, msg, destinations, type) ->
  destinations = destinations instanceof Array && destinations || [destinations]
  destinations.forEach (destination) ->
    set = exports.socketIdsBy[type]
    if socketIds = set.members(destination)
      socketIds.slice(0).forEach (socketId) ->
        set.removeFromAll(socketId) unless send.socketId(socketId, msg, destination)
  true