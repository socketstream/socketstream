class exports.UserSession

  constructor: (@id, @session) ->
    @key = "user:#{@id}"
    @_subscribe()
  
  logout: (cb) ->
    @_unsubscribe()
    
    
  _subscribe: (cb) ->
    RPS.subscribe @key, (err, res) -> cb(res)
    
  _unsubscribe: (cb) ->
    RPS.unsubscribe @key, (err, res) -> cb(res)
      
