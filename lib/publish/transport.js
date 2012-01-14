
exports.init = function() {
  var transport;
  transport = null;
  return {
    use: function(nameOrModule, config) {
      if (config == null) config = {};
      return transport = (function() {
        if (typeof nameOrModule === 'object') {
          return nameOrModule;
        } else {
          try {
            return require("./transports/" + nameOrModule);
          } catch (e) {
            throw new Error('Unable to find publish event transport');
          }
        }
      })();
    },
    load: function() {
      if (transport == null) this.use('internal');
      return transport.init();
    }
  };
};
