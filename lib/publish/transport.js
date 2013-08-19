// Publish Event Transport
// -----------------------
// Right now you can either use the internal transport or inbuilt Redis module
// The idea behind making this modular is to allow others to experiment with other message queues / servers

module.exports = function() {
  var config, transport;
  transport = null;
  config = {};
  return {
    use: function(nameOrModule, cfg) {
      var modPath;
      if (cfg == null) {
        cfg = {};
      }
      config = cfg;
      return transport = (function() {
        if (typeof nameOrModule === 'function') {
          return nameOrModule;
        } else {
          modPath = "./transports/" + nameOrModule;
          if (require.resolve(modPath)) {
            return require(modPath);
          } else {
            throw new Error("Unable to find Publish Event Transport '" + nameOrModule + "' internally. Please pass a module");
          }
        }
      })();
    },
    load: function() {
      if (transport == null) {
        this.use('internal');
      }
      return transport(config);
    }
  };
};
