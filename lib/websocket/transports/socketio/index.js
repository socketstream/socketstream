var coffee, fs, processSession, qs, socketio, utils;

fs = require('fs');

qs = require('querystring');

socketio = require('socket.io');

if (process.env['SS_DEV']) coffee = require('coffee-script');

utils = require('../../../utils/misc.js');

exports.init = function(emitter, httpServer, config) {
  var io;
  io = socketio.listen(httpServer);
  io.set('log level', 1);
  io.set('close timeout', 60 * 60 * 120);
  if ((config != null ? config.io : void 0) != null) config.io(io);
  io.sockets.on('connection', function(socket) {
    if (processSession(socket)) {
      socket.on('message', function(msg) {
        var clientIp, content, meta, type, _ref;
        try {
          _ref = utils.parseWsMessage(msg), type = _ref[0], content = _ref[1];
          clientIp = socket.manager.handshaken[socket.id].address.address;
          meta = {
            socketId: socket.id,
            sessionId: socket.sessionId,
            clientIp: clientIp,
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
        libs: function() {
          return fs.readFileSync(__dirname + '/client.min.js', 'utf8');
        },
        code: function() {
          var ext, input;
          ext = (coffee != null) && 'coffee' || 'js';
          input = fs.readFileSync(__dirname + '/wrapper.' + ext, 'utf8');
          return (coffee != null) && coffee.compile(input) || input;
        }
      };
    }
  };
};

processSession = function(socket) {
  var cookie, rawCookie, sessionId;
  if (socket.sessionId) return true;
  try {
    rawCookie = socket.handshake.headers.cookie;
    cookie = qs.parse(rawCookie);
    sessionId = cookie['connect.sid'].split('.')[0];
    return socket.sessionId = sessionId;
  } catch (e) {
    console.log('Warning: connect.sid session cookie not detected. User may have cookies disabled or session cookie has expired');
    return false;
  }
};
