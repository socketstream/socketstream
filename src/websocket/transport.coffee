# Websocket Transport
# -------------------
# Define the transport to carry all realtime requests
# Uses 'socketio' by default. See README to see how to configure it

exports.init = (client, emitter) ->
  
  transport = null
  config = {}

  use: (nameOrModule, cfg = {}) ->
    config = cfg
    transport = if typeof(nameOrModule) == 'object'
      nameOrModule
    else
      modPath = "./transports/#{nameOrModule}"
      if require.resolve(modPath)
        require(modPath)
      else
        throw new Error("Unable to find the '#{nameOrModule}' websocket transport internally")

  load: (httpServer) ->
    @use 'socketio' unless transport?
    transport.init(client, emitter, httpServer, config)