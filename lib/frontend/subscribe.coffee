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

  # Receive an internal system message
  system: (message) ->
    try
      obj = JSON.parse(message)
      if obj.session_id and (socket = SS.connected.sessions[obj.session_id])      
        system_commands[obj.command](socket, obj)
    catch e
      SS.log.error.message 'Invalid system message received'
      console.log e


# Used to dispatch messages to multiple channels or users
dispatchMultiple = (name, message) ->
  obj = JSON.parse(message)
  throw new Error('No #{name.toLowerCase()} specified in incoming event message') unless obj.destinations and obj.destinations.length > 0
  SS.log.incoming.event("#{name} [#{obj.destinations.join(', ')}]", message)
  already_messaged = []
  obj.destinations.map (destination) ->
    collection = SS.connected[name.toLowerCase()]
    if sockets = collection.getAll(destination)
      sockets.forEach (socket) ->
        return if socket.disconnected && collection.remove(destination, socket)
        socket.emit('event', message) && already_messaged.push(socket) unless already_messaged.include(socket)


# Execute system commands on this front end server
# These are basically used to keep websockets in sync with the users and channels
# they are related to so we know which sockets to messages when events come in
system_commands =

  user_authenticated: (socket, obj) ->
    SS.connected.users.add(obj.user_id, socket)     if obj.user_id

  user_logout: (socket, obj) ->
    SS.connected.users.remove(obj.user_id, socket)  if obj.user_id

  channel_subscribe: (socket, obj) ->
    SS.connected.channels.add(obj.name, socket)     if obj.name

  channel_unsubscribe: (socket, obj) ->
    SS.connected.channels.remove(obj.name, socket)  if obj.name



