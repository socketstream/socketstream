// Websocket Transport
// -------------------
// Define the transport to carry all realtime requests
// Uses 'engineio' by default. See README to see how to configure it
'use strict';

module.exports = function(ss, emitter) {
  var mid,
      active,
      config = {};

  return {
    get server() {
      return active? active.server: null;
    },
    use: function(nameOrModule, cfg) {
      mid = nameOrModule;
      config = cfg || config;

      // log warning
      // if (ss.require.resolve(nameOrModule, 'websocket/transports') == null) {
      //   throw new Error('Unable to find the \'' + nameOrModule + '\' websocket transport internally');
      // }
    },
    load: function() {
      //TODO error handle missing require from within the sockjs/engineio module
      var transport = ss.require(mid, 'websocket/transports', 'engineio');
      if (typeof transport !== 'function') {
        ss.log.error('Transport for "'+mid+'" must be a function(ss, emitter, config) default:', transport);
      } else {
        return (active = transport(ss, emitter, config));
      }
    }
  };
};
