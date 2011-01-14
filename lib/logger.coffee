class exports.Logger
  
  constructor: (@level) ->
    
  staticFile: (request) ->
    sys.log "STATIC: #{request.url}"

  createNewSession: (session) ->
    sys.log "\x1B[1;35mCreating new session: #{session.id}\x1B[0m"

  incomingCall: (data, client) ->
    params = sys.inspect(data.params) if data.params
    sys.log "#{client.sessionId} \x1B[1;36m->\x1b[0m #{data.method}#{if params then ': ' + params else ''}"

  outgoingCall: (client, method) ->
    sys.log "#{client.sessionId} \x1B[1;32m<-\x1b[0m #{method.callee}"

