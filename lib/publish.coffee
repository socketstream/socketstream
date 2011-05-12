# Publish
# -------
# Publishes messages to Redis

key = SS.config.redis.key_prefix

# Every node instance should listen in on the broadcast channel
SS.redis.pubsub.subscribe "#{key}:broadcast"

# Publish event to every client connected to every server
exports.broadcast = (event, params) -> 
  SS.log.incoming.event("Broadcast", event, params)
  message = JSON.stringify({event: event, params: params})
  SS.redis.main.publish "#{key}:broadcast", message

# Publish event to a user regardless of which server they are connected to
exports.user = (user_id, event, params) ->
  SS.log.incoming.event("User #{user_id}", event, params)
  message = JSON.stringify({event: event, params: params})
  SS.redis.main.publish "#{key}:user:#{user_id}", message

# Publish event to array of user ids
exports.users = (user_ids, event, params) ->
  user_ids.map (user_id) -> exports.user(user_id, event, params)
 
# WIP: Publish to a group (users can join or leave groups at anytime)
exports.group = (name, event, params) ->
  # TODO check for spaces or invalid group name
  SS.redis.main.smembers "#{key}:group:#{name}", (err, user_ids) ->
    exports.users(user_ids, event, params)
