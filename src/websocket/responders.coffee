# Websocket Message Responders
# ----------------------------
# Allows you to define responders which will listen out for incoming messages of that type
# The 'events' and 'rpc' responders are loaded by default, though even this can be overruled by calling clear()

exports.init = (root, emitter, ss) ->

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
      responders.push mod.init(root, ss, config)
    catch e
      throw new Error('Unable to initalize websocket responder')
      console.error e
    
  load: ->
    middlewareStack = middleware.load()

    if useDefaults
      @add 'events'
      @add 'rpc'

    responders.map (mod) ->
      responder = mod.load(middlewareStack)

      # Listen to incoming requests and invoke server.request
      emitter.on mod.messagePrefix, (msg, meta, cb) ->
        responder.server.request(msg, meta, cb)
      
      responder
