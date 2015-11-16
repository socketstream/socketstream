// Browser Events Responder
// ------------------------
// Takes incoming event message types and converts them into a format suitable for sending over the websocket
'use strict';


var fs = require('fs'),
    path = require('path'),
    debug = require('debug')('socketstream:responder');

module.exports = function(responderId, config, ss) {
  var code, name;
  name = config && config.name || 'events';

  // Serve client code
  code = fs.readFileSync(path.join(__dirname, 'client.js'), 'utf8');
  ss.client.send('mod', 'events-responder', code, {}); //TODO define file instead. client manager will load/reload as needed
  ss.client.send('code', 'init', 'require(\'events-responder\')(' + responderId + ', {}, require(\'socketstream\').send(' + responderId + '));');
  debug('events-responder client ready.');

  // Return API
  return {
    name: name,
    interfaces: function() {
      return {
        websocket: function(msg, meta, send) {
          return send(JSON.stringify(msg));
        }
      };
    }
  };
};
