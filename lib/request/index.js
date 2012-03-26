
exports.init = function(root, client, ss) {
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
        return responders.push(mod.init(root, ss, client, config));
      } catch (e) {
        throw new Error('Unable to initalize websocket responder');
        return console.error(e);
      }
    },
    load: function() {
      var middlewareStack, output;
      middlewareStack = middleware.load();
      if (useDefaults) {
        this.add('events');
        this.add('rpc');
      }
      output = {};
      responders.map(function(mod) {
        var responder;
        responder = mod.load(middlewareStack);
        return output[mod.messagePrefix] = responder;
      });
      return output;
    }
  };
};
