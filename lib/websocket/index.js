var EventEmitter2, emitter;

EventEmitter2 = require('eventemitter2').EventEmitter2;

emitter = new EventEmitter2({
  wildcard: true
});

exports.init = function(root, request, ss) {
  var transport;
  transport = require('./transport').init(emitter);
  return {
    transport: transport,
    load: function(httpServer, responders, eventTransport) {
      var name, responder, thisTransport;
      thisTransport = transport.load(httpServer);
      require('./subscribe/index').init(eventTransport, thisTransport, emitter);
      for (name in responders) {
        responder = responders[name];
        emitter.on(name, responder.server.websocket);
      }
      return thisTransport;
    }
  };
};
