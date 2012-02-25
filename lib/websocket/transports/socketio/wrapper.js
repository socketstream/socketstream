
window.SocketStream.transport = {
  connect: function(cb) {
    var conn;
    conn = io.connect();
    conn.on('message', function(msg, meta) {
      var content, i, type;
      if ((i = msg.indexOf('|')) > 0) {
        type = msg.substr(0, i);
        content = msg.substr(i + 1);
        return SocketStream.message.emit(type, content, meta);
      } else {
        return console.error('Invalid websocket message received:', msg);
      }
    });
    conn.on('ready', function(cb) {
      return SocketStream.event.emit('ready');
    });
    conn.on('disconnect', function() {
      return SocketStream.event.emit('disconnect');
    });
    conn.on('reconnect', function() {
      return SocketStream.event.emit('reconnect');
    });
    conn.on('connect', function() {
      return SocketStream.event.emit('connect');
    });
    return SocketStream.transport.send = function(msg) {
      return conn.send(msg);
    };
  }
};
