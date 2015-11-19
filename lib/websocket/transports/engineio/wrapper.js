'use strict';

// Engine.io client-side Wrapper
var reconnectSwitch = false;
var reconnectionTimeout = 1000;
var ss = require('socketstream');

module.exports = function(serverStatus, message, _config) {
  var config = Object.create(_config);
  if (config.secure === undefined) { config.secure = document.location.protocol === 'https:'; }
  if (config.host === undefined) { config.host = document.location.hostname; }
  if (config.port === undefined) { config.port = config.secure ? 443 : document.location.port }
  //TODO config.path per view
  // config: enablesXDR policyPort rememberUpgrade

  return {
    connect: function(){
      var sock = new eio.Socket(config);

      // Events: open, message, close, error, flush, drain, upgradeError, upgrade
      sock.on('open', function() {
        //config = port:"3000", secure:false, host: "localhost", hostname:"localhost"
        //sock.id = session id

        var sessionToken = require('socketstream-session').getSessionToken(),
            sessionId = require('socketstream-session').getSessionId();
        if (sessionToken || sessionId) {
          sock.send('X|' + sessionToken + '|' + sessionId); // sending access claims
        } else{
          //TODO perhaps for config.localStorage it is sent by server
          console.error('Unable to obtain session ID');
        }
      });

      sock.on('message', function (e) {

        var i, x, msg = e;

        // Attempt to get the responderId from each message
        if ( (i = msg.indexOf('|')) > 0) {

          var responderId = msg.substr(0, i),
                  content = msg.substr(i+1);

          switch (responderId) {

            // X = a system message
            case 'X':
              //TODO OK|session token in case of httpOnly cookie
              if (reconnectSwitch === false) {
                serverStatus.emit('ready');
              } else {
                reconnectionTimeout = 1000;
                serverStatus.emit('reconnect');
              }
              break;

            // 0 = incoming events
            // As events are so integral to SocketStream rather than breaking up the JSON message
            // sent over the event transport for efficiencies sake we append the meta data (typically
            // the channel name) at the end of the JSON message after the final pipe | character
            case '0':
              if ( (x = content.lastIndexOf('|')) > 0) {
                var event = content.substr(0, x),
                     meta = content.substr(x+1);
                message.emit(responderId, event, meta);
              } else {
                console.error('Invalid event message received:', msg);
              }
              break;

            // All other messages are passed directly to the relevant Request Responder
            default:
              message.emit(responderId, content);
          }

        // EVERY message should have a responderId
        // If we can't find one, it's a malformed request
        } else {
          console.error('Invalid websocket message received:', msg);
        }

      });

      var attemptReconnect = function(time){
        setTimeout(function(){
          ss.assignTransport(config);
          if (ss.server.event !== 'reconnect') {
            reconnectionTimeout *= 1.5;
          }
        }, time);
        clearTimeout();
      };

      sock.on('close', function() {
        reconnectSwitch = true;
        serverStatus.emit('disconnect');
        attemptReconnect(reconnectionTimeout);
      });

      // Return a function which is used to send all messages to the server
      return sock.send.bind(sock); // (receives msg object)
    }
  };
};
