util = require("util")

self = {}
class exports.Logger
  
  constructor: ->
    self = @
    
  staticFile: (request) ->
    util.log "STATIC: #{request.url}" if $SS.config.log_level >= 2

  createNewSession: (session) -> 
    util.log "\x1B[1;35mCreating new session: #{session.id}\x1B[0m"

  incomingCall: (data, client) ->
    util.log "#{client.sessionId} \x1B[1;36m->\x1b[0m #{data.method}#{self._params(data.params)}" if $SS.config.log_level >= 2

  outgoingCall: (client, method) ->
    util.log "#{client.sessionId} \x1B[1;32m<-\x1b[0m #{method.callee}" if $SS.config.log_level >= 2
  
  publish:
    
    broadcast: (event, params) ->
      util.log "Broadcast \x1B[1;36m=>\x1b[0m #{event}#{self._params(params)}" if $SS.config.log_level >= 2

    user: (user_id, event, params) ->
      util.log "User #{user_id} \x1B[1;36m=>\x1b[0m #{event}#{self._params(params)}" if $SS.config.log_level >= 2
      
  
  _params: (params) ->
    params = util.inspect(params) if params and $SS.config.log_level >= 3
    if params then ': ' + params else ''