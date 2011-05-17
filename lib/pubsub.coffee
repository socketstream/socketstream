# Publish and Subscribe
# ---------------------
# Publishes messages to other clients/users via Redis and deliver them over websockets

key = SS.config.redis.key_prefix

# Every instance of SocketStream should listen in on the broadcast and groups channel upon startup
SS.redis.pubsub.subscribe "#{key}:broadcast"
SS.redis.pubsub.subscribe "#{key}:channels"

# PUBLISH

exports.publish =

  # Publish event to every client connected to every server
  broadcast: (event, params) -> 
    throw new Error('Event Name (first argument) must be a string') unless typeof(event) == 'string'
    throw new Error('Params (second argument) must be provided (even if just an empty string or object)') if typeof(params) == 'undefined'
    SS.log.outgoing.event "Broadcast", event, params
    SS.redis.main.publish "#{key}:broadcast", JSON.stringify({event: event, params: params})
  
  # Publish to private channel (users can subscribe/unsubscribe to channels at anytime - see session code)
  channels: (channels, event, params) ->
    channels = [channels] unless typeof(channels) == 'object'
    throw new Error('No channels specified (first argument)') unless channels.length > 0
    throw new Error('Event Name (second argument) must be a string') unless typeof(event) == 'string'
    throw new Error('Params (third argument) must be provided (even if just an empty string or object)') if typeof(params) == 'undefined'
    SS.log.outgoing.event "Channels [#{channels.join(', ')}]", event, params
    SS.redis.main.publish "#{key}:channels", JSON.stringify({event: event, params: params, channels: channels})

  # Alias Channels
  channel: (channels, event, params) -> @channels(channels, event, params)

  # Publish event to a user regardless of which server they are connected to
  user: (user_id, event, params) ->
    throw new Error('User ID (first argument) must be provided as a number or string') if typeof(user_id) == 'undefined'
    throw new Error('Event Name (second argument) must be a string') unless typeof(event) == 'string'
    throw new Error('Params (third argument) must be provided (even if just an empty string or object)') if typeof(params) == 'undefined'
    SS.log.outgoing.event "User #{user_id}", event, params
    SS.redis.main.publish "#{key}:user:#{user_id}", JSON.stringify({event: event, params: params})

  # Publish event to array of user ids
  users: (user_ids, event, params) ->
    throw new Error('User IDs (first argument) must be an array') unless typeof(user_ids) == 'object'
    user_ids.map (user_id) => @user(user_id, event, params)


# SUBSCRIBE

# Listen out for and dispatch incoming messages
exports.listen = (socket) ->
  SS.redis.pubsub.on 'message', (channel, message) ->
    channel = channel.split(':')
    if channel && channel[0] == SS.config.redis.key_prefix
      dispatch[channel[1]](parse(message), socket, channel[2])


# PRIVATE
  
# Dispatch messages via websockets
dispatch =

  # Send a message to everyone
  broadcast: (message, socket, options) ->
    SS.log.incoming.event("Broadcast", message)
    socket.broadcast JSON.stringify(message)

  # Send a message to a sub-set of connected clients via private channel
  channels: (message, socket, options) ->
    throw new Error('No channels specified in incoming channel event message') unless message.channels and message.channels.length > 0
    SS.log.incoming.event("Channels [#{message.channels.join(', ')}]", message)
    message.channels.map (channel) ->
      if clients = SS.internal.channels[channel]
        clients.forEach (client) ->
          client.remote message

  # Send a message to a particular user
  user: (message, socket, options) ->
    client = SS.users.connected[options]
    return if client and client.connected
      SS.log.incoming.event("User #{message.user_id}", message)
      client.remote message
    else
      null # if client is no longer online, drop message


# Appends the message type. TODO: Perform sanity check before blindling forwarding on
parse = (message) ->
  msg = JSON.parse(message)
  msg.type = 'event'
  msg
