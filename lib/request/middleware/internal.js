// Internal Request Middleware
// ---------------------------
// Internal middleware occupies the top-level namespace, i.e. does not contain any dots
'use strict';

var colors = require('colors/safe');

module.exports = function(ss) {
  return {
    debug: function(color) {
      return function(request, response, next) {
        ss.log.info(colors[color || 'yellow']('Debug incoming message >>\n'), request);
        return next();
      };
    },
    session: function(options) {
      if (!options) {
        options = {};
      }
      return function(request, response, next) {
        if (request.sessionId) {
          return ss.session.find(request.sessionId, request.socketId, function(thisSession) {
            request.session = thisSession;
            if (options.debug) {
              ss.log.info(colors.yellow('Debug session >>\n'), thisSession);
            }
            if (thisSession) {
              return next();
            } else {
              return ss.log.error(('! Error: Session ID ' + request.sessionId +
                ' not found. Use Redis to persist sessions between server restarts. Terminating incoming request').red);
            }
          });
        } else {
          throw new Error('Cannot load session. Request does not contain a sessionId');
        }
      };
    }
  };
};
