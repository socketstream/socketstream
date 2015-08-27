// Websocket Transport
// -------------------
// Define the transport to carry all realtime requests
// Uses 'engineio' by default. See README to see how to configure it
'use strict';

module.exports = function(ss, emitter) {
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
      return (transport = (function() {
        if (typeof nameOrModule === 'function') {
          return nameOrModule;
        } else {
          modPath = './transports/' + nameOrModule;
          if (require.resolve(modPath)) {
            return require(modPath);
          } else {
            throw new Error('Unable to find the \'' + nameOrModule + '\' websocket transport internally');
          }
        }
      })());
    },
    load: function(httpServer, sessionOptions) {
      if (transport == null) {
        this.use(require('ss-engine.io'));
      }
      return transport(ss, emitter, httpServer, config, sessionOptions);
    }
  };
};
