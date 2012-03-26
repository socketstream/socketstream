var fs, processSession, qs, socketio, utils;

fs = require('fs');

qs = require('querystring');

socketio = require('socket.io');

utils = require('../../../utils/misc.js');

exports.init = function(client, emitter, httpServer, config) {
  var code, io, socketioClient;
  io = socketio.listen(httpServer);
  io.set('log level', 1);
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
  socketioClient = fs.readFileSync(__dirname + '/client.min.js', 'utf8');
  client.assets.add('lib', 'socketio-client', socketioClient, {
    minified: true
  });
  code = fs.readFileSync(__dirname + '/wrapper.' + (process.env['SS_DEV'] && 'coffee' || 'js'), 'utf8');
  client.assets.add('mod', 'socketstream-transport', code, {
    coffee: process.env['SS_DEV']
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
