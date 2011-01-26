class exports.UserSession

  constructor: (@id, @session) ->
    @pubsub_key = "socketstream:user:#{@id}"
    @_subscribe()
    @
  
  destroy: (cb) ->
    @_unsubscribe()

  _subscribe: (cb) ->
    RPS.subscribe @pubsub_key
    SocketStream.connected_users[@id] = @session.client
    
  _unsubscribe: ->
    RPS.unsubscribe @pubsub_key
    delete SocketStream.connected_users[@id]
