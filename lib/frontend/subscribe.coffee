# Subscribe
# ---------
# Subscribes to a ZeroMQ 'pub' socket on the Router, or internal RPC event emitter (in single process mode).
# Listens out for any messages proxied from Redis via the /lib/router/event_proxy.coffee file

rpc = new (require('../rpc/connection.coffee')).Subscriber

# Listen out of incoming events from Redis proxied from the Router (so we can process them or push them upstream to websocket clients)
exports.init = ->

  rpc.listen (event_type, message) ->
    try
      obj = JSON.parse(message)
      dispatch[event_type](obj)
    catch e
      SS.log.error.exception(e)


# Private

# Dispatch incoming events via websockets
dispatch =

  # Send a message to everyone
  broadcast: (message) ->
    SS.log.incoming.event "Broadcast", message
    SS.io.sockets.emit 'event', message.event, message.params

  # Only message sessions which have subscribed to these channels
  channels: (message) ->
    dispatchMultiple 'Channels', message

  # Send a message to all clients on this node signed in with that user_id
  users: (message, uid) ->
    dispatchMultiple 'Users', message

  # Send a message to specific socket_ids (undocumented for now as this may change in the future)
  sockets: (message) ->
    if message.destinations?.any()
      SS.log.incoming.event "Socket", message
      for socket_id in message.destinations
        SS.io.sockets.sockets[socket_id]?.emit('event', message.event, message.params, socket_id)


# Used to dispatch messages to multiple channels or users
dispatchMultiple = (name, message) ->
  throw new Error('No #{name.toLowerCase()} specified in incoming event message') unless message.destinations?.any()
  SS.log.incoming.event("#{name} [#{message.destinations.join(', ')}]", message)
  message.destinations.map (destination) ->

    # Traversing the Socket.IO messageect tree is temporary. Want to rearchitect this in the future to improve
    # performance when thousands of clients are simultaneously connected, without changing the developer API
    for socket_id, socket of SS.io.sockets.sockets
      try
        if (name == 'Channels' && socket.ss.session.channels.include(destination)) or (name == 'Users' && socket.ss.session.user_id == destination)
          socket.emit('event', message.event, message.params, destination) unless socket.disconnected

