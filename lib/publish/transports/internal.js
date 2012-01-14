var EventEmitter2, emitter;

EventEmitter2 = require('eventemitter2').EventEmitter2;

emitter = new EventEmitter2();

exports.init = function() {
  return {
    listen: function(cb) {
      return emitter.on('event', function(obj) {
        return cb(obj);
      });
    },
    send: function(obj) {
      return emitter.emit('event', obj);
    }
  };
};
