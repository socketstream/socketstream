class exports.Publish

  constructor: ->
    $SS.redis.pubsub.subscribe 'socketstream:broadcast'
  
  # Publish event to a user regardless of which server they are connected to
  user: (user_id, event, params) ->
    $SS.sys.log.publish.user(user_id, event, params)
    message = JSON.stringify({event: event, params: params})
    R.publish "socketstream:user:#{user_id}", message

  # Publish event to array of user ids
  users: (user_ids, event, params) ->
    user_ids.map (user_id) => @user(user_id, event, params)
 
  # Publish event to every client connected to every server
  broadcast: (event, params) -> 
    $SS.sys.log.publish.broadcast(event, params)
    message = JSON.stringify({event: event, params: params})
    R.publish "socketstream:broadcast", message
  
