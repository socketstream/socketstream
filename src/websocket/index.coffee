# Websocket Module
# ----------------
# Handles everything to do with the websocket transport and message responders

EventEmitter2 = require('eventemitter2').EventEmitter2
emitter = new EventEmitter2({wildcard: true})

exports.init = (root, request, ss) ->

  transport = require('./transport').init(emitter)

  # Return API
  transport: transport

  load: (httpServer, responders, eventTransport) ->

    thisTransport = transport.load(httpServer)
    
    # Listen for incoming events
    require('./subscribe/index').init(eventTransport, thisTransport, emitter)

    # Listen to incoming requests and invoke server.request
    for name, responder of responders
      emitter.on(name, responder.server.websocket)

    # Return active WS transport
    thisTransport

