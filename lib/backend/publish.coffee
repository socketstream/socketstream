# Publish
# -------
# Publishes messages to other clients/users via Redis to be sent upstream to frontend servers (via the router)

key = SS.config.redis.key_prefix

module.exports =

  # Publish event to every client connected to every server
  broadcast: (event, params) -> 
    throw new Error('Event Name (first argument) must be a string') unless typeof(event) == 'string'
    throw new Error('Params (second argument) must be provided (even if just an empty string or object)') if typeof(params) == 'undefined'
    SS.log.outgoing.event "Broadcast", event, params
    SS.redis.main.publish "#{key}:broadcast", JSON.stringify({event: event, params: params})
  
  # Publish to private channel (users can subscribe/unsubscribe to channels at anytime - see session code)
  channels: (channels, event, params) ->
    send 'Channels', channels, event, params

  # Alias Channels
  channel: (channels, event, params) ->
    @channels(channels, event, params)

  # Publish event to array of user ids
  users: (users, event, params) ->
    send 'Users', users, event, params

  # Alias Users
  user: (users, event, params) ->
    @users(users, event, params)


# Private

# Send a message to one or more destinations
send = (name, destinations, event, params = null) ->
  destinations = [destinations] unless typeof(destinations) == 'object'
  throw new Error("No #{name} specified (first argument)") unless destinations.length > 0
  throw new Error('Event Name (second argument) must be a string') unless typeof(event) == 'string'
  SS.log.outgoing.event "#{name} [#{destinations.join(', ')}]", event, params
  SS.redis.main.publish "#{key}:#{name.toLowerCase()}", JSON.stringify({event: event, params: params, destinations: destinations})
