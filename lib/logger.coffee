self = {}
class exports.Logger
  
  constructor: ->
    self = @
    
  staticFile: (request) ->
    sys.log "STATIC: #{request.url}" if $SS.config.log_level >= 2

  createNewSession: (session) -> 
    sys.log "\x1B[1;35mCreating new session: #{session.id}\x1B[0m"

  incomingCall: (data, client) ->
    sys.log "#{client.sessionId} \x1B[1;36m->\x1b[0m #{data.method}#{self._params(data.params)}" if $SS.config.log_level >= 2

  outgoingCall: (client, method) ->
    sys.log "#{client.sessionId} \x1B[1;32m<-\x1b[0m #{method.callee}" if $SS.config.log_level >= 2
  
  publish:
    
    broadcast: (event, params) ->
      sys.log "Broadcast \x1B[1;36m=>\x1b[0m #{event}#{self._params(params)}" if $SS.config.log_level >= 2

    user: (user_id, event, params) ->
      sys.log "User #{user_id} \x1B[1;36m=>\x1b[0m #{event}#{self._params(params)}" if $SS.config.log_level >= 2
      
  
  _params: (params) ->
    params = sys.inspect(params) if params and $SS.config.log_level >= 3
    if params then ': ' + params else ''