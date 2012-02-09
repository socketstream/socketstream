
exports.init = function(root, emitter, ss) {
  var middleware, responders, useDefaults;
  middleware = require('./middleware').init(root, ss);
  responders = [];
  useDefaults = true;
  return {
    clear: function() {
      return useDefaults = false;
    },
    add: function(nameOrModule, config) {
      var mod, modPath;
      if (config == null) config = null;
      mod = (function() {
        if (typeof nameOrModule === 'object') {
          return nameOrModule;
        } else {
          modPath = "./responders/" + nameOrModule;
          if (require.resolve(modPath)) {
            return require(modPath);
          } else {
            throw new Error("Unable to find the '" + nameOrModule + "' websocket responder internally");
          }
        }
      })();
      try {
        return responders.push(mod.init(root, ss, config));
      } catch (e) {
        throw new Error('Unable to initalize websocket responder');
        return console.error(e);
      }
    },
    load: function() {
      var middlewareStack;
      middlewareStack = middleware.load();
      if (useDefaults) {
        this.add('events');
        this.add('rpc');
      }
      return responders.map(function(mod) {
        var responder;
        responder = mod.load(middlewareStack);
        emitter.on(mod.messagePrefix, function(msg, meta, cb) {
          return responder.server.request(msg, meta, cb);
        });
        return responder;
      });
    }
  };
};
