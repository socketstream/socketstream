// Engine.IO server-side wrapper
'use strict';
var fs = require('fs'),
    qs = require('querystring'),
    engine = require('engine.io'),
    log = require('../../../utils/log');

var openSocketsById = {};

var processSession = function(socket) {
  try {
    var raw= socket.request.headers.cookie.split(';');
    raw.some(function(item) {
        var item_parsed = item.split('=');
        if (item_parsed[0] == ' connect.sid') {
          socket.sessionId = item_parsed[1];
          return true;
        }
    });
    return true;
  }
  catch(e) {
    log.warn('Warning: connect.sid session cookie not detected. User may have cookies disabled or session cookie has expired');
    return false;
  }
};

module.exports = function(ss, messageEmitter, httpServer, config){
  var clientFileName, engineioClient, code, ws;
  config = config || {};
  config.server = config.server || {};
  config.client = config.client || {};

  clientFileName = '/client.js';

  // Send Engine.IO client-side code
  engineioClient = fs.readFileSync(__dirname + clientFileName, 'utf8');
  ss.client.send('lib', 'engine.io-client', engineioClient, {minified: false}); // tested this with minified: true ; worked fine.

  // Send socketstream-transport module
  code = fs.readFileSync(__dirname + '/wrapper.js', 'utf8');
  ss.client.send('mod', 'socketstream-transport', code);

  // Tell the SocketStream client to use this transport, passing any client-side config along to the wrapper
  ss.client.send('code', 'transport', "require('socketstream').assignTransport(" + JSON.stringify(config.client) + ");");

  // don't set up server for CLI and test
  if (httpServer == null) return;
  
  // Create a new Engine.IO server and bind to /ws
  ws = engine.attach(httpServer, config.server);
  // ws.installHandlers(httpServer, {prefix: '/ws'});

  // Handle incoming connections
  ws.on('connection', function(socket) {

    if (processSession(socket)) {
    // Store this here before it gets cleaned up after the websocket upgrade
    socket.remoteAddress = socket.request.connection.remoteAddress;

    // Get real IP if behind proxy
    var xForwardedFor = socket.request.headers['x-forwarded-for'];
    if (xForwardedFor) {
      socket.remoteAddress = xForwardedFor.split(',')[0];
    }

    // Allow this connection to be addressed by the socket ID
    openSocketsById[socket.id] = socket;
    ss.session.find(socket.sessionId, socket.id, function(session){
      socket.send('X|OK');
    });

      // changed from data
      socket.on('message', function(msg) {
        try {
          var i,responderId,content,meta;
          if ( (i = msg.indexOf('|')) > 0) {
            responderId = msg.substr(0, i);
            content = msg.substr(i+1);
          } else { throw('Message does not contain a responderId');}

          meta = {socketId: socket.id, sessionId: socket.sessionId, clientIp: socket.remoteAddress, transport: 'engineio'};

          // Invoke the relevant Request Responder, passing a callback function which
          // will automatically direct any response back to the correct client-side code
          messageEmitter.emit(responderId, content, meta, function(data){
            return socket.send(responderId + '|' + data);
          });
        }
        catch (e) {
          log.error('Invalid websocket message received:', msg);
        }
      });

      // If the browser disconnects, remove this connection from openSocketsById
      socket.on('close', function() {
        if(openSocketsById[socket.id]) {
          delete openSocketsById[socket.id];
        }
      });
    }
  });

  // Return API for sending events
  // Note the '0' message prefix (which signifies the responderId) is reserved for sending events
  return {

    event: function() {

      return {

        // Send the same message to every open socket
        all: function(msg) {
          for (var id in openSocketsById) {
            if (openSocketsById.hasOwnProperty(id)) {
              openSocketsById[id].send('0|' + msg + '|null');
            }
          }
        },

        // Send an event to a specific socket
        // Note: 'meta' is typically the name of the channel
        socketId: function(id, msg, meta) {
          var socket = openSocketsById[id];
          if (socket) {
            return socket.send('0|' + msg + '|' + meta);
          } else {
            return false;
          }

        }

      }
    }
  }
}

