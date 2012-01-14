# Websocket Transport
# -------------------
# Define the transport to carry all realtime requests
# Uses 'socketio' by default. See README to see how to configure it

exports.init = (emitter) ->
  
  transport = null
  config = {}

  use: (nameOrModule, cfg = {}) ->
    config = cfg
    transport = if typeof(nameOrModule) == 'object'
      nameOrModule
    else
      try
        require("./transports/#{nameOrModule}")
      catch e
        throw new Error("Unable to find the '#{nameOrModule}' websocket transport internally")

  load: (httpServer) ->
    @use 'socketio' unless transport?
    transport.init(emitter, httpServer, config)