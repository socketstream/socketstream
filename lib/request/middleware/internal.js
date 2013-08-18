// Internal Request Middleware
// ---------------------------
// Internal middleware occupies the top-level namespace, i.e. does not contain any dots

require('colors');

module.exports = function(ss) {
  var session;
  session = require('../../session');
  return {
    debug: function(color) {
      if (color == null) {
        color = 'yellow';
      }
      return function(request, response, next) {
        console.log("Debug incoming message >>\n"[color], request);
        return next();
      };
    },
    session: function(options) {
      if (options == null) {
        options = {};
      }
      return function(request, response, next) {
        if (request.sessionId) {
          return session.find(request.sessionId, request.socketId, function(thisSession) {
            request.session = thisSession;
            if (options.debug != null) {
              console.log("Debug session >>\n".yellow, thisSession);
            }
            if (thisSession) {
              return next();
            } else {
              return console.log(("! Error: Session ID " + request.sessionId + " not found. Use Redis to persist sessions between server restarts. Terminating incoming request").red);
            }
          });
        } else {
          throw new Error('Cannot load session. Request does not contain a sessionId');
        }
      };
    }
  };
};
