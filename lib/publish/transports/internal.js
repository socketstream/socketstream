var EventEmitter2, emitter;

EventEmitter2 = require('eventemitter2').EventEmitter2;

emitter = new EventEmitter2();

exports.init = function() {
  return {
    listen: function(cb) {
      return emitter.on('event', cb);
    },
    send: function(obj) {
      return emitter.emit('event', obj);
    }
  };
};
