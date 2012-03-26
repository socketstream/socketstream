# Request
# -------
# Process incoming requests regardless of transport (e.g. websocket, HTTP, method call from console)
# Request Responders allow you to define responders which will listen out for incoming messages of that type
# Each responder can expose a number of interfaces - e.g. Websocket, Console
# Responders can optionally choose to use the middleware stack provided
# The 'events' and 'rpc' responders are loaded by default, though even this can be overruled by calling clear()

exports.init = (root, client, ss) ->
  middleware = require('./middleware').init(root, ss)
  
  responders = []
  useDefaults = true

  clear: ->
    useDefaults = false

  add: (nameOrModule, config = null) ->
    mod = if typeof(nameOrModule) == 'object'
      nameOrModule
    else
      modPath = "./responders/#{nameOrModule}"
      if require.resolve(modPath)
        require(modPath)
      else
        throw new Error("Unable to find the '#{nameOrModule}' websocket responder internally")
    try
      responders.push mod.init(root, ss, client, config)
    catch e
      throw new Error('Unable to initalize websocket responder')
      console.error e
    
  load: ->
    middlewareStack = middleware.load()

    if useDefaults
      @add('events')
      @add('rpc')

    output = {}

    responders.map (mod) ->
      responder = mod.load(middlewareStack)
      output[mod.messagePrefix] = responder

    output
