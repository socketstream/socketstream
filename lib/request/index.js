// Request Responders
// ------------------
// Processes incoming requests regardless of transport (e.g. websocket, HTTP, method call from console)
// Each responder can expose a number of interfaces - e.g. Websocket, Console, and will only respond to incoming
// messages of it's type (e.g. 'rpc', 'events', etc)
// Responders can optionally choose to use the middleware stack provided
// The 'events' and 'rpc' responders are loaded by default, though even this can be overruled by calling clear()
'use strict';

module.exports = function(ss) {
  var middleware = require('./middleware')(ss),
      responderCount = 0,
      responders = {},
      useDefaults = true;

  return {
    clear: function() {
      //jshint -W093
      return (useDefaults = false);
    },
    add: function(nameOrModule, config) {
      config = config || null;
      var mod = ss.require(nameOrModule, 'request/responders',function(err) {
            throw new Error('Unable to find the \''+err.id+'\' Request Responder internally');
          });

      try {
        var id = nameOrModule === 'events' && '0' || ++responderCount;
        //jshint -W093
        return (responders[id] = mod(id, config, ss));
      } catch (e) {
        var responderName = responders[id] && responders[id].name || '',
            err = new Error('Unable to initialize Request Responder \'' + responderName + '\'');
        err.stack = e.stack;
        throw e;
      }
    },
    load: function() {
      var middlewareStack = middleware.load();
      if (useDefaults) {
        this.add('events');
        this.add('rpc');
      }
      var output = {};
      for (var id in responders) {
        var responder = responders[id];
        output[id] = {
          name: responder.name,
          interfaces: responder.interfaces(middlewareStack)
        };
      }
      return output;
    }
  };
};
