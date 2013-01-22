# Websocket Transport
# -------------------
# Define the transport to carry all realtime requests
# Uses 'engineio' by default. See README to see how to configure it

module.exports = (ss, emitter) ->
  
  transport = null
  config = {}

  use: (nameOrModule, cfg = {}) ->
    config = cfg
    transport = if typeof(nameOrModule) == 'function'
      nameOrModule
    else
      modPath = "./transports/#{nameOrModule}"
      if require.resolve(modPath)
        require(modPath)
      else
        throw new Error("Unable to find the '#{nameOrModule}' websocket transport internally")

  load: (httpServer) ->
    @use('engineio') unless transport?
    transport(ss, emitter, httpServer, config)