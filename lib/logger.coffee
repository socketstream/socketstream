class exports.Logger
  
  constructor: ->
    
  staticFile: (request) ->
    sys.log "STATIC: #{request.url}" if $SS.config.log_level >= 2

  createNewSession: (session) -> 
    sys.log "\x1B[1;35mCreating new session: #{session.id}\x1B[0m"

  incomingCall: (data, client) ->
    params = sys.inspect(data.params) if data.params and $SS.config.log_level >= 3
    sys.log "#{client.sessionId} \x1B[1;36m->\x1b[0m #{data.method}#{if params then ': ' + params else ''}" if $SS.config.log_level >= 2

  outgoingCall: (client, method) ->
    sys.log "#{client.sessionId} \x1B[1;32m<-\x1b[0m #{method.callee}" if $SS.config.log_level >= 2

