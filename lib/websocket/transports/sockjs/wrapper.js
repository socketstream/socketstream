/* globals -ss */
// SockJS client-side Wrapper
'use strict';

var reconnectSwitch = false;
var reconnectionTimeout = 1000;

module.exports = function(serverStatus, message, config){

  config = config || {};

  return {
    connect: function(){

      var sock = new SockJS('/ws', {}, config);

      sock.onopen = function() {
        var sessionId = getCookie('connect.sid');
        if (sessionId) {
          sock.send('X|' + sessionId);
        } else{
          console.error('Unable to obtain session ID');
        }
      };

      sock.onmessage = function(e) {

        var i, x, msg = e.data;

        // Attempt to get the responderId from each message
        if ( (i = msg.indexOf('|')) > 0) {

          var responderId = msg.substr(0, i),
                  content = msg.substr(i+1);

          switch (responderId) {

            // X = a system message
            case 'X':
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

      };

      var attemptReconnect = function(time){
        setTimeout(function(){
          ss.assignTransport(config);
          if (ss.server.event !== "reconnect") {
            reconnectionTimeout *= 1.5;
          }
        }, time);
        clearTimeout();
      };

      sock.onclose = function() {
        reconnectSwitch = true;
        serverStatus.emit('disconnect');
        attemptReconnect(reconnectionTimeout);
      };

      // Return a function which is used to send all messages to the server
      return function(msg){
        sock.send(msg)
      };
    }
  }
}


// Private

function getCookie(cookie_name)
{
  // http://www.thesitewizard.com/javascripts/cookies.shtml
  var cookie_string = document.cookie;
  if (cookie_string.length !== 0) {
    var cookie_value = cookie_string.match ( '(^|;)[\s]*' + cookie_name + '=([^;]*)' );
    return decodeURIComponent( cookie_value[2] ) ;
  }
  return '' ;
}