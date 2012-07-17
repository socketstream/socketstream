# Request Responders
# ------------------
# Processes incoming requests regardless of transport (e.g. websocket, HTTP, method call from console)
# Each responder can expose a number of interfaces - e.g. Websocket, Console, and will only respond to incoming
# messages of it's type (e.g. 'rpc', 'events', etc)
# Responders can optionally choose to use the middleware stack provided
# The 'events' and 'rpc' responders are loaded by default, though even this can be overruled by calling clear()

module.exports = (ss) ->

  middleware = require('./middleware')(ss)
  
  responderCount = 0
  responders = {}
  useDefaults = true

  clear: ->
    useDefaults = false

  add: (nameOrModule, config = null) ->
    mod = if typeof(nameOrModule) == 'function'
      nameOrModule
    else
      modPath = "./responders/#{nameOrModule}"
      if require.resolve(modPath)
        require(modPath)
      else
        throw new Error("Unable to find the '#{nameOrModule}' Request Responder internally")
    try
      id = nameOrModule == 'events' && '0' || ++responderCount
      responders[id] = mod(id, config, ss)
    catch e
      responderName = responders[id] && responders[id].name || ''
      err = Error("Unable to initialize Request Responder '#{responderName}'")
      err.stack = e.stack
      throw e
    
  load: ->
    middlewareStack = middleware.load()

    if useDefaults
      @add('events')
      @add('rpc')

    output = {}
    for id, responder of responders
      output[id] = {name: responder.name, interfaces: responder.interfaces(middlewareStack)} 
    output
