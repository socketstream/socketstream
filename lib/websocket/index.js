var EventEmitter2, emitter;

EventEmitter2 = require('eventemitter2').EventEmitter2;

emitter = new EventEmitter2({
  wildcard: true
});

exports.init = function(root, extensions) {
  return {
    transport: require('./transport').init(emitter),
    responders: require('./responders').init(root, emitter, extensions),
    message: emitter
  };
};
