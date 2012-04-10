# Request Responders
# ------------------
# Processes incoming requests regardless of transport (e.g. websocket, HTTP, method call from console)
# Each responder can expose a number of interfaces - e.g. Websocket, Console, and will only respond to incoming
# messages of it's type (e.g. 'rpc', 'events', etc)
# Responders can optionally choose to use the middleware stack provided
# The 'events' and 'rpc' responders are loaded by default, though even this can be overruled by calling clear()

exports.init = (ss, client) ->
  middleware = require('./middleware').init(ss)
  
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
      responders.push mod.init(ss, config)
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
