class exports.UserSession

  constructor: (@id, @session) ->
    @key = "user:#{@id}"
    @_subscribe()
    @
  
  logout: (cb) ->
    @_unsubscribe()

  _subscribe: (cb) ->
    RPS.subscribe @key
    SocketStream.connected_users[@id] = @session.client
    
  _unsubscribe: ->
    RPS.unsubscribe @key, (err, res) =>
      delete SocketStream.connected_users[@id]
