
exports.init = function() {
  var config, transport;
  transport = null;
  config = {};
  return {
    use: function(nameOrModule, c) {
      if (c == null) c = {};
      config = c;
      return transport = (function() {
        if (typeof nameOrModule === 'object') {
          return nameOrModule;
        } else {
          try {
            return require("./transports/" + nameOrModule);
          } catch (e) {
            throw new Error("Unable to find Publish Event Transport '" + nameOrModule + "' internally. Please pass a module");
          }
        }
      })();
    },
    load: function() {
      if (transport == null) this.use('internal');
      return transport.init(config);
    }
  };
};
