# Subscribe
# ---------
# Subscribes to a ZeroMQ 'pub' socket on the Router. Effectively listens out for any messages proxied by the Router from Redis

zeromq = require('zeromq')

# Listen out of incoming events from Redis proxied from the Router (so we can process them or push them upstream to websocket clients)
sub = zeromq.createSocket('sub')
sub.connect SS.config.cluster.sockets.fe_pub
sub.subscribe('events')
sub.on 'message', (msg_type, event_type, message) ->
  dispatch[event_type.toString()](message.toString())

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
          sockets_to_message.push(socket) unless socket.disconnected or sockets_to_message.include(socket)

    # Deliver message to each socket
    sockets_to_message.forEach (socket) -> socket.emit('event', message)
