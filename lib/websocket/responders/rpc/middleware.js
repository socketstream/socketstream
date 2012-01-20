var apiTree, pathlib;

require('colors');

pathlib = require('path');

apiTree = require('apitree');

exports.init = function(root, session, ss) {
  var dir, inbuilt, k, middleware, v;
  dir = pathlib.join(root, 'server/rpc/middleware');
  inbuilt = {
    debug: function() {
      return function(request, response, next) {
        console.log("Debug incoming message >>\n".yellow, request);
        return next();
      };
    },
    loadSession: function(options) {
      if (options == null) options = {};
      return function(request, response, next) {
        if (request.sessionId) {
          return session.findOrCreate(request.sessionId, request.socketId, function(thisSession) {
            request.session = thisSession;
            if (options.debug != null) {
              console.log("Debug session >>\n".yellow, thisSession._store);
            }
            return next();
          });
        } else {
          throw new Error('Cannot load session. Request does not contin a sessionId');
        }
      };
    }
  };
  middleware = apiTree.createApiTree(dir);
  for (k in inbuilt) {
    v = inbuilt[k];
    middleware[k] = v;
  }
  return middleware;
};
