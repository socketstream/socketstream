
exports.init = function(emitter) {
  var config, transport;
  transport = null;
  config = {};
  return {
    use: function(nameOrModule, cfg) {
      var modPath;
      if (cfg == null) cfg = {};
      config = cfg;
      return transport = (function() {
        if (typeof nameOrModule === 'object') {
          return nameOrModule;
        } else {
          modPath = "./transports/" + nameOrModule;
          if (require.resolve(modPath)) {
            return require(modPath);
          } else {
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
