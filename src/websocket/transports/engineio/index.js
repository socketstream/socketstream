// Engine.IO server-side wrapper

var fs = require('fs'),
    qs = require('querystring'),
    engine = require('engine.io');

var openSocketsById = {};


// Enable/disable client-side debug output according to `process.env.DEBUG`.
// See https://github.com/LearnBoost/browserbuild
// and https://github.com/visionmedia/debug

var debug = process.env.DEBUG 
          ? process.env.DEBUG.split(',').filter(function(l){
              return !!l.match(/^engine/)
            })
          : [];

var filterShim = 
  [ ""
  , ";(function(){"
  , "  function wrap(o) {"
  , "    if (!Array.prototype.filter){"
  , "    o.filter = function(fun){"
  , "      for (var i = 0, res = [], len = this.len; i < len; i++) {"
  , "        if (fun(this[i])) res.push(val);"
  , "      }"
  , "      return res;"
  , "    };"
  , "  }"
  , "  return o;"
  , "}" ]

if (debug.length) {
  debug = filterShim.concat(
  [ "  if (window['localStorage']) {"
  , "    var debug = window['localStorage']['debug'] || '';"
  , "    debug = wrap(debug.split(','))"
                      // Remove old references, if any...
  , "                 .filter(function(l){ return !l.match(/^engine/) && l; })"
                      // ... then add the new one(s).
  , "                 .concat(['" + debug.join("', '") + "'])"
  , "                 .join(',');"
  , "    window['localStorage']['setItem']('debug', debug);"
  , "  };"
  , "})();"
  , "" 
  ]).join("\n");
  
} else {
  debug = filterShim.concat(
  [ "  if (window['localStorage']) {"
  , "    var debug = window['localStorage']['debug']"
  , "    if (debug) {"
  , "      debug = wrap(debug.split(','))"
  , "                   .filter(function(l){ return !l.match(/^engine/); })"
  , "                   .join(',');"
  , "      window['localStorage']['setItem']('debug', debug);"
  , "    };"
  , "  };"
  , "})();"
  , "" 
  ]).join("\n");
}

module.exports = function(ss, messageEmitter, httpServer, config){

  var config = config || {};
  config.server = config.server || {};
  config.client = config.client || {};
  
  var clientFileName = '/client.js';

  // Set or clear the client-side debug mode. Must be sent as a lib to be effective.
  if (config.client.debug == true) {
    ss.client.send('lib', 'engine.io-debug', debug, {minified: false});
    clientFileName = '/client.dev.js';
  }

  // Send Engine.IO client-side code
  var engineioClient = fs.readFileSync(__dirname + clientFileName, 'utf8');
  ss.client.send('lib', 'engine.io-client', engineioClient, {minified: false});

  // Send socketstream-transport module
  var code = fs.readFileSync(__dirname + '/wrapper.js', 'utf8');
  ss.client.send('mod', 'socketstream-transport', code);

  // Tell the SocketStream client to use this transport, passing any client-side config along to the wrapper
  ss.client.send('code', 'transport', "require('socketstream').assignTransport(" + JSON.stringify(config.client) + ");");

  // Create a new Engine.IO server and bind to /ws
  var ws = engine.attach(httpServer, config.server);
  // ws.installHandlers(httpServer, {prefix: '/ws'});

  // Handle incoming connections
  ws.on('connection', function(socket) {

    if (processSession(socket)) {
    // Store this here before it gets cleaned up after the websocket upgrade
    socket.remoteAddress = socket.request.connection.remoteAddress;

    // Get real IP if behind proxy
    var xForwardedFor = socket.request.headers['x-forwarded-for'];
    if (xForwardedFor) socket.remoteAddress = xForwardedFor.split(',')[0];

    // Allow this connection to be addressed by the socket ID
    openSocketsById[socket.id] = socket;
    ss.session.find(socket.sessionId, socket.id, function(session){ 
      socket.send('X|OK');
    });

      // changed from data
      socket.on('message', function(msg) {
        try {
          var i,responderId,content;
          if ( (i = msg.indexOf('|')) > 0) {
            responderId = msg.substr(0, i);
            content = msg.substr(i+1);
          } else { throw('Message does not contain a responderId');}

          var meta = {socketId: socket.id, sessionId: socket.sessionId, clientIp: socket.remoteAddress, transport: 'engineio'}

          // Invoke the relevant Request Responder, passing a callback function which
          // will automatically direct any response back to the correct client-side code
          messageEmitter.emit(responderId, content, meta, function(data){
            return socket.send(responderId + '|' + data);
          });
        }
        catch (e) {
          console.log('Invalid websocket message received:', msg);
        }
      });

      // If the browser disconnects, remove this connection from openSocketsById
      socket.on('close', function() {
        if(openSocketsById[socket.id]) delete openSocketsById[socket.id];
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
          for (id in openSocketsById)
            openSocketsById[id].send('0|' + msg + '|null');
        },

        // Send an event to a specific socket
        // Note: 'meta' is typically the name of the channel
        socketId: function(id, msg, meta) {
          if (socket = openSocketsById[id]) {
            return socket.send('0|' + msg + '|' + meta)
          } else {
            return false;
          }

        }

      }
    }
  }
}

var processSession = function(socket) {
  try {
    var rawCookie;
    if(socket.upgraded) {
      rawCookie = socket.transport.socket.upgradeReq.cookie;
    }
    else {
      rawCookie = socket.transport.request.headers.cookie;
    }
    var cookie = qs.parse(rawCookie, "; ");
    var sessionId = cookie['connect.sid'].split('.')[0];
    var unsignedSessionId = sessionId.split(':')[1].replace(/\s/g, "+");
    socket.sessionId = unsignedSessionId;
    return true;
  }
  catch(e) {
    console.log('Warning: connect.sid session cookie not detected. User may have cookies disabled or session cookie has expired');
    return false;
  }
};
