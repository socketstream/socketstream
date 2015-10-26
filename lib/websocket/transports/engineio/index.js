// Engine.IO server-side wrapper
'use strict';

var fs = require('fs'),
    http = require('http');

var openSocketsById = {};

module.exports = function(ss, messageEmitter, config){
  config = config || {};
  config.server = config.server || {};
  config.client = config.client || {};

  // Send Engine.IO client-side code
  var clientPath = ss.require.resolve('engine.io-client/engine.io.js', { warn:'Please add "engine.io-client" as an npm dependency'});
  if (clientPath) {
    var engineioClient = fs.readFileSync(clientPath, 'utf8');
    ss.client.send('lib', 'engine.io-client', engineioClient, {minified: false}); // tested this with minified: true ; worked fine.
  }

  // Send socketstream-transport module
  var code = fs.readFileSync(__dirname + '/wrapper.js', 'utf8');
  ss.client.send('mod', 'socketstream-transport', code);

  // Tell the SocketStream client to use this transport, passing any client-side config along to the wrapper
  ss.client.send('code', 'transport', "require('socketstream').assignTransport(" + JSON.stringify(config.client) + ");");

  // Return API for sending events
  // Note the '0' message prefix (which signifies the responderId) is reserved for sending events
  var api = {
    get server() {
      if (!this._server) {
        this._server = http.createServer(function(req,res) {
          return ss.http.middleware(req,res);
        });

        // Create a new Engine.IO server and bind to /ws
        var engine = ss.require('engine.io'),
            ws = this.ws = engine.attach(this._server, config.server);

        // Handle incoming connections
        ws.on('connection', onConnection);
      }
      return this._server;
    },

    event: eventFn
  };

  return api;

  function onConnection(socket) {
    var sessionId = ss.session.extractSocketSessionId(socket.request);
    if (sessionId) {
      socket.sessionId = sessionId;

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
          ss.log.error('Invalid websocket message received:', msg);
        }
      });

      // If the browser disconnects, remove this connection from openSocketsById
      socket.on('close', function() {
        if(openSocketsById[socket.id]) {
          delete openSocketsById[socket.id];
        }
      });
    }
  }

  function eventFn() {
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
