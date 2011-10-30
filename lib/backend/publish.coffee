# Publish
# -------
# Publishes messages to other clients/users via Redis to be sent upstream to frontend servers (via the router)

# Shall we send events to Redis or direct to the internal EventEmitter as an RPC request?
publish_method = SS.redis && 'redis' || 'internal'

# If we're not using the Redis proxy, create the RPC publisher here
rpc = new (require('../rpc/connection.coffee')).Publisher unless SS.redis

module.exports =

  # Publish event to every client connected to every server
  broadcast: (event, params) ->
    throw new Error('Event Name (first argument) must be a string') unless typeof(event) == 'string'
    throw new Error('Params (second argument) must be provided (even if just an empty string or object)') if typeof(params) == 'undefined'
    SS.log.outgoing.event "Broadcast", event, params
    send 'broadcast', {event: event, params: params}

  # Publish to private channel (users can subscribe/unsubscribe to channels at anytime - see session code)
  channels: (channels, event, params) ->
    sendMultiple 'Channels', channels, event, params

  # Alias Channels
  channel: (channels, event, params) ->
    @channels(channels, event, params)

  # Publish event to array of user ids
  users: (users, event, params) ->
    sendMultiple 'Users', users, event, params

  # Alias Users
  user: (users, event, params) ->
    @users(users, event, params)

  # Publish event to array of socket ids
  sockets: (sockets, event, params) ->
    sendMultiple 'Sockets', sockets, event, params

  # Alias Sockets
  socket: (sockets, event, params) ->
    @sockets(sockets, event, params)

# Private

# Serialize a message and publish via the correct method
send = (msg_type, message) ->
  msg = JSON.stringify(message)
  publishers[publish_method](msg_type, msg)

# Send a message to one or more destinations via Redis
# As this is a back end server it has no knowledge of websockets and must not publish
# directly to websockets (even though you are able in single-process mode)
sendMultiple = (name, destinations, event, params = null) ->
  destinations = [destinations] unless typeof(destinations) == 'object'
  throw new Error("No #{name} specified (first argument)") unless destinations.length > 0
  throw new Error('Event Name (second argument) must be a string') unless typeof(event) == 'string'
  SS.log.outgoing.event "#{name} [#{destinations.join(', ')}]", event, params
  send name, {event: event, params: params, destinations: destinations}



# Publish Methods
# ---------------
# Either send directly through RPC Publisher connection, or proxy through Redis for better scalability

publishers =

  redis: (msg_type, message) ->
    redis_channel = "#{SS.config.redis.key_prefix}:#{msg_type.toLowerCase()}"
    SS.redis.main.publish redis_channel, message

  internal: (msg_type, message) ->
    rpc.send msg_type.toLowerCase(), message

