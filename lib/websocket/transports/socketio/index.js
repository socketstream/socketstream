var coffee, fs, processSession, socketio, utils;

fs = require('fs');

socketio = require('socket.io');

if (process.env['SS_DEV']) coffee = require('coffee-script');

utils = require('../../../utils/misc.js');

exports.init = function(emitter, httpServer, config) {
  var io;
  io = socketio.listen(httpServer);
  io.set('log level', 1);
  if ((config != null ? config.io : void 0) != null) config.io(io);
  io.sockets.on('connection', function(socket) {
    if (processSession(socket)) {
      socket.on('message', function(msg) {
        var content, meta, type, _ref;
        try {
          _ref = utils.parseWsMessage(msg), type = _ref[0], content = _ref[1];
          meta = {
            socketId: socket.id,
            sessionId: socket.sessionId,
            transport: 'socketio'
          };
          return emitter.emit(type, content, meta, function(data) {
            return socket.send(data);
          });
        } catch (e) {
          return console.log('Invalid websocket message received:'.red, msg);
        }
      });
      return socket.emit('ready');
    }
  });
  return {
    event: function() {
      return {
        all: function(msg) {
          return io.sockets.emit('message', msg);
        },
        socketId: function(id, msg, meta) {
          var socket;
          if (meta == null) meta = null;
          if ((socket = io.sockets.sockets[id]) != null) {
            return socket.emit('message', msg, meta);
          } else {
            return false;
          }
        }
      };
    },
    client: function() {
      return {
        code: function() {
          var ext, input, output;
          output = [];
          output.push(fs.readFileSync(__dirname + '/client.min.js', 'utf8'));
          ext = (coffee != null) && 'coffee' || 'js';
          input = fs.readFileSync(__dirname + '/wrapper.' + ext, 'utf8');
          output.push((coffee != null) && coffee.compile(input) || input);
          return output.join(";\n");
        }
      };
    }
  };
};

processSession = function(socket) {
  var cookie, i;
  if (socket.sessionId) return true;
  cookie = socket.handshake.headers.cookie;
  if ((i = cookie.indexOf('connect.sid')) >= 0) {
    return socket.sessionId = cookie.substr(i + 12, i + 24);
  } else {
    console.error('Warning: connect.sid not detected in cookie');
    return false;
  }
};
