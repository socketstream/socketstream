var session;

session = require('../session');

exports.init = function(root, emitter, ss) {
  var responders, useDefaults;
  responders = [];
  useDefaults = true;
  return {
    clear: function() {
      return useDefaults = false;
    },
    add: function(nameOrModule, config) {
      var mod;
      if (config == null) config = null;
      if (typeof nameOrModule === 'object') {
        mod = nameOrModule;
      } else {
        try {
          mod = require("./responders/" + nameOrModule);
        } catch (e) {
          throw new Error("Unable to find the '" + nameOrModule + "' websocket responder internally");
        }
      }
      try {
        return responders.push(mod.init(root, session, ss, config));
      } catch (e) {
        throw new Error('Unable to initalize websocket responder');
        return console.error(e);
      }
    },
    load: function() {
      if (useDefaults) {
        this.add('events');
        this.add('rpc');
      }
      return responders.map(function(mod) {
        var responder;
        responder = mod.load();
        emitter.on(mod.messagePrefix, function(msg, meta, cb) {
          return responder.server.request(msg, meta, cb);
        });
        return responder;
      });
    }
  };
};
