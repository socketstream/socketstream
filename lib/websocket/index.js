// Websocket Module
// ----------------
// Handles everything to do with the websocket transport and message responders

var EventEmitter2, emitter;

EventEmitter2 = require('eventemitter2').EventEmitter2;

emitter = new EventEmitter2({
  wildcard: true
});

module.exports = function(ss, request) {
  var transport;
 
  // Return API
  transport = require('./transport')(ss, emitter);
 
  return {
    transport: transport,
    load: function(httpServer, responders, eventTransport) {
      var id, responder, thisTransport;
      thisTransport = transport.load(httpServer);

      // Dispatch incoming events to websocket clients      
      require('./event_dispatcher')(eventTransport, thisTransport, emitter);

      // Listen to incoming requests and invoke server.request      
      for (id in responders) {
        responder = responders[id];
        emitter.on(id, responder.interfaces.websocket);
      }

      // Return active WS transport      
      return thisTransport;
    }
  };
};
