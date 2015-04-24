// Internal Request Middleware
// ---------------------------
// Internal middleware occupies the top-level namespace, i.e. does not contain any dots
'use strict';

require('colors');

module.exports = function() {
  var session = require('../../session'),
      log = require('../../utils/log');
  return {
    debug: function(color) {
      if (!color) {
        color = 'yellow';
      }
      return function(request, response, next) {
        log.info('Debug incoming message >>\n'[color], request);
        return next();
      };
    },
    session: function(options) {
      if (!options) {
        options = {};
      }
      return function(request, response, next) {
        if (request.sessionId) {
          return session.find(request.sessionId, request.socketId, function(thisSession) {
            request.session = thisSession;
            if (options.debug) {
              log.info('Debug session >>\n'.yellow, thisSession);
            }
            if (thisSession) {
              return next();
            } else {
              return log.error(('! Error: Session ID ' + request.sessionId +
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
