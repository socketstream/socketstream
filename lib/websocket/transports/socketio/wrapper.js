var conn;

conn = null;

module.exports = function(emitter, message) {
  return {
    connect: function(fn) {
      conn = io.connect();
      conn.on('message', function(msg, meta) {
        var content, i, responderId;
        if ((i = msg.indexOf('|')) > 0) {
          responderId = msg.substr(0, i);
          content = msg.substr(i + 1);
          return message.emit(responderId, content, meta);
        } else {
          return console.error('Invalid websocket message received:', msg);
        }
      });
      conn.on('ready', function(cb) {
        return emitter.emit('ready');
      });
      conn.on('disconnect', function() {
        return emitter.emit('disconnect');
      });
      conn.on('reconnect', function() {
        return emitter.emit('reconnect');
      });
      conn.on('connect', function() {
        return emitter.emit('connect');
      });
      return function(msg) {
        return conn.send(msg);
      };
    }
  };
};
