# Subscribe
# ---------
# Subscribes to a ZeroMQ 'pub' socket on the Router, or internal RPC event emitter (in single process mode).
# Listens out for any messages proxied from Redis via the /lib/router/event_proxy.coffee file

rpc = new (require('../rpc/connection.coffee')).Subscriber

# Listen out of incoming events from Redis proxied from the Router (so we can process them or push them upstream to websocket clients)
exports.init = ->

  rpc.listen (event_type, message) -> dispatch[event_type](message)


# Private

# Dispatch incoming events via websockets
dispatch =

  # Send a message to everyone
  broadcast: (message) ->
    SS.log.incoming.event "Broadcast", message
    SS.io.sockets.emit 'event', message

  # Only message sessions which have subscribed to these channels
  channels: (message) ->
    dispatchMultiple 'Channels', message

  # Send a message to all clients on this node signed in with that user_id
  users: (message, uid) ->
    dispatchMultiple 'Users', message


# Used to dispatch messages to multiple channels or users
dispatchMultiple = (name, message) ->
  obj = JSON.parse(message)
  throw new Error('No #{name.toLowerCase()} specified in incoming event message') unless obj.destinations and obj.destinations.length > 0
  SS.log.incoming.event("#{name} [#{obj.destinations.join(', ')}]", message)
  sockets_to_message = []
  obj.destinations.map (destination) ->

    # Traversing the Socket.IO object tree is temporary. Want to rearchitect this in the future to improve
    # performance when thousands of clients are simultaneously connected, without changing the developer API
    for socket_id, socket of SS.io.sockets.sockets
      try
        if (name == 'Channels' && socket.ss.session.channels.include(destination)) or (name == 'Users' && socket.ss.session.user_id == destination)
          socket.emit('event', message, destination) unless socket.disconnected

