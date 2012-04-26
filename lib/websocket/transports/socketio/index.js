var fs, processSession, qs, socketio, utils;

fs = require('fs');

qs = require('querystring');

socketio = require('socket.io');

utils = require('../../../utils/misc.js');

module.exports = function(client, emitter, httpServer, config) {
  var code, io, socketioClient;
  io = socketio.listen(httpServer);
  io.set('log level', 1);
  if ((config != null ? config.io : void 0) != null) config.io(io);
  io.sockets.on('connection', function(socket) {
    if (processSession(socket)) {
      socket.on('message', function(msg) {
        var clientIp, content, meta, responderId, _ref;
        try {
          _ref = utils.parseWsMessage(msg), responderId = _ref[0], content = _ref[1];
          clientIp = socket.manager.handshaken[socket.id].address.address;
          meta = {
            socketId: socket.id,
            sessionId: socket.sessionId,
            clientIp: clientIp,
            transport: 'socketio'
          };
          return emitter.emit(responderId, content, meta, function(data) {
            return socket.send(responderId + '|' + data);
          });
        } catch (e) {
          return console.log('Invalid websocket message received:'.red, msg);
        }
      });
      return socket.emit('ready');
    }
  });
  socketioClient = fs.readFileSync(__dirname + '/client.min.js', 'utf8');
  client.assets.send('lib', 'socketio-client', socketioClient, {
    minified: true
  });
  code = fs.readFileSync(__dirname + '/wrapper.' + (process.env['SS_DEV'] && 'coffee' || 'js'), 'utf8');
  client.assets.send('mod', 'socketstream-transport', code, {
    coffee: process.env['SS_DEV']
  });
  return {
    event: function() {
      return {
        all: function(msg) {
          return io.sockets.emit('message', '0|' + msg);
        },
        socketId: function(id, msg, meta) {
          var socket;
          if (meta == null) meta = null;
          if ((socket = io.sockets.sockets[id]) != null) {
            return socket.emit('message', '0|' + msg, meta);
          } else {
            return false;
          }
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
    cookie = qs.parse(rawCookie, '; ');
    sessionId = cookie['connect.sid'].split('.')[0];
    return socket.sessionId = sessionId;
  } catch (e) {
    console.log('Warning: connect.sid session cookie not detected. User may have cookies disabled or session cookie has expired');
    return false;
  }
};
