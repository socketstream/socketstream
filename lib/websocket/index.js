// Websocket Module
// ----------------
// Handles everything to do with the websocket transport and message responders
'use strict';

var EventEmitter2 = require('eventemitter2').EventEmitter2,
    emitter = new EventEmitter2({
      wildcard: true
    });

module.exports = function(ss) {
 
  // Return API
  var transport = require('./transport')(ss, emitter);
 
  return {
    transport: transport,
    unload: function() {},
    load: function(httpServer, responders, eventTransport, sessionOptions) {
      var thisTransport = transport.load(httpServer, sessionOptions);

      // Dispatch incoming events to websocket clients      
      require('./event_dispatcher')(eventTransport, thisTransport, emitter);

      // Listen to incoming requests and invoke server.request      
      for (var id in responders) {
        var responder = responders[id];
        emitter.on(id, responder.interfaces.websocket);
      }

      // Return active WS transport      
      return thisTransport;
    }
  };
};
