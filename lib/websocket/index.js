var EventEmitter2, emitter;

EventEmitter2 = require('eventemitter2').EventEmitter2;

emitter = new EventEmitter2({
  wildcard: true
});

module.exports = function(client, request, ss) {
  var transport;
  transport = require('./transport')(client, emitter);
  return {
    transport: transport,
    load: function(httpServer, responders, eventTransport) {
      var id, responder, thisTransport;
      thisTransport = transport.load(httpServer);
      require('./event_dispatcher')(eventTransport, thisTransport, emitter);
      for (id in responders) {
        responder = responders[id];
        emitter.on(id, responder.interfaces.websocket);
      }
      return thisTransport;
    }
  };
};
