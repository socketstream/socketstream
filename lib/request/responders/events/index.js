// Browser Events Responder
// ------------------------
// Takes incoming event message types and converts them into a format suitable for sending over the websocket

var fs;

fs = require('fs');

module.exports = function(responderId, config, ss) {
  var code, name;
  name = config && config.name || 'events';

  // Serve client code
  code = fs.readFileSync(__dirname + '/client.js', 'utf8');
  ss.client.send('mod', 'events-responder', code, {});
  ss.client.send('code', 'init', "require('events-responder')(" + responderId + ", {}, require('socketstream').send(" + responderId + "));");

  // Return API
  return {    
    name: name,
    interfaces: function(middleware) {
      return {
        websocket: function(msg, meta, send) {
          return send(JSON.stringify(msg));
        }
      };
    }
  };
};
