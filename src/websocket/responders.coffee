# Websocket Message Responders
# ----------------------------
# Allows you to define responders which will listen out for incoming messages of that type
# The 'events' and 'rpc' responders are loaded by default, though even this can be overruled by calling clear()

session = require('../session')

exports.init = (root, emitter, ss) ->
  
  responders = []
  useDefaults = true

  clear: ->
    useDefaults = false

  add: (nameOrModule, config = null) ->
    if typeof(nameOrModule) == 'object'
      mod = nameOrModule
    else
      try
        mod = require("./responders/#{nameOrModule}")
      catch e
        throw new Error("Unable to find the '#{nameOrModule}' websocket responder internally")
    try
      responders.push mod.init(root, session, ss, config)
    catch e
      throw new Error('Unable to initalize websocket responder')
      console.error e
    
  load: ->
    if useDefaults
      @add 'events'
      @add 'rpc'

    responders.map (mod) ->
      responder = mod.load()

      # Listen to incoming requests and invoke server.request
      emitter.on mod.messagePrefix, (msg, meta, cb) ->
        responder.server.request(msg, meta, cb)
      
      responder
