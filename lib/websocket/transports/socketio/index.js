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
    return processSession(socket, function() {
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
    });
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

processSession = function(socket, cb) {
  var idLength;
  idLength = 32;
  if (socket.sessionId && sessionId.length === idLength) return cb();
  return socket.emit('getSessionId', function(sessionId) {
    if (sessionId && sessionId.length === idLength) {
      socket.sessionId = sessionId;
      return cb();
    } else {
      sessionId = utils.randomString(idLength);
      return socket.emit('setSessionId', sessionId, function(response) {
        socket.sessionId = sessionId;
        return cb();
      });
    }
  });
};
