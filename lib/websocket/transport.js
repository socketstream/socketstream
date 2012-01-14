
exports.init = function(emitter) {
  var config, transport;
  transport = null;
  config = {};
  return {
    use: function(nameOrModule, cfg) {
      if (cfg == null) cfg = {};
      config = cfg;
      return transport = (function() {
        if (typeof nameOrModule === 'object') {
          return nameOrModule;
        } else {
          try {
            return require("./transports/" + nameOrModule);
          } catch (e) {
            throw new Error("Unable to find the '" + nameOrModule + "' websocket transport internally");
          }
        }
      })();
    },
    load: function(httpServer) {
      if (transport == null) this.use('socketio');
      return transport.init(emitter, httpServer, config);
    }
  };
};
