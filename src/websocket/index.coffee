# Websocket Module
# ----------------
# Handles everything to do with the websocket transport and message responders

EventEmitter2 = require('eventemitter2').EventEmitter2
emitter = new EventEmitter2({wildcard: true})

module.exports = (ss, request) ->

  transport = require('./transport')(ss, emitter)

  # Return API
  transport: transport

  load: (httpServer, responders, eventTransport) ->

    thisTransport = transport.load(httpServer)
    
    # Dispatch incoming events to websocket clients
    require('./event_dispatcher')(eventTransport, thisTransport, emitter)

    # Listen to incoming requests and invoke server.request
    for id, responder of responders
      emitter.on(id, responder.interfaces.websocket)

    # Return active WS transport
    thisTransport

