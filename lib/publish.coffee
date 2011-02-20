# Publish
# -------
# Publishes messages to Redis

key = 'socketstream'

# Every node instance should listen in on the broadcast channel
$SS.redis.pubsub.subscribe "#{key}:broadcast"

# Publish event to a user regardless of which server they are connected to
exports.user = (user_id, event, params) ->
  $SS.sys.log.publish.user(user_id, event, params)
  message = JSON.stringify({event: event, params: params})
  R.publish "#{key}:user:#{user_id}", message

# Publish event to array of user ids
exports.users = (user_ids, event, params) ->
  user_ids.map (user_id) -> exports.user(user_id, event, params)
 
# Publish event to every client connected to every server
exports.broadcast = (event, params) -> 
  $SS.sys.log.publish.broadcast(event, params)
  message = JSON.stringify({event: event, params: params})
  R.publish "#{key}:broadcast", message
  
