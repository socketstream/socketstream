// Request Responders
// ------------------
// Processes incoming requests regardless of transport (e.g. websocket, HTTP, method call from console)
// Each responder can expose a number of interfaces - e.g. Websocket, Console, and will only respond to incoming
// messages of it's type (e.g. 'rpc', 'events', etc)
// Responders can optionally choose to use the middleware stack provided
// The 'events' and 'rpc' responders are loaded by default, though even this can be overruled by calling clear()

module.exports = function(ss) {
  var middleware, responderCount, responders, useDefaults;
  middleware = require('./middleware')(ss);
  responderCount = 0;
  responders = {};
  useDefaults = true;
  return {
    clear: function() {
      return useDefaults = false;
    },
    add: function(nameOrModule, config) {
      var err, id, mod, modPath, responderName;
      if (config == null) {
        config = null;
      }
      mod = (function() {
        if (typeof nameOrModule === 'function') {
          return nameOrModule;
        } else {
          modPath = "./responders/" + nameOrModule;
          if (require.resolve(modPath)) {
            return require(modPath);
          } else {
            throw new Error("Unable to find the '" + nameOrModule + "' Request Responder internally");
          }
        }
      })();
      try {
        id = nameOrModule === 'events' && '0' || ++responderCount;
        return responders[id] = mod(id, config, ss);
      } catch (e) {
        responderName = responders[id] && responders[id].name || '';
        err = Error("Unable to initialize Request Responder '" + responderName + "'");
        err.stack = e.stack;
        throw e;
      }
    },
    load: function() {
      var id, middlewareStack, output, responder;
      middlewareStack = middleware.load();
      if (useDefaults) {
        this.add('events');
        this.add('rpc');
      }
      output = {};
      for (id in responders) {
        responder = responders[id];
        output[id] = {
          name: responder.name,
          interfaces: responder.interfaces(middlewareStack)
        };
      }
      return output;
    }
  };
};
