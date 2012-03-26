var fs, messagePrefix;

fs = require('fs');

messagePrefix = 'event';

exports.init = function(root, ss, client, config) {
  return {
    messagePrefix: messagePrefix,
    load: function() {
      var code;
      code = fs.readFileSync(__dirname + '/client.' + (process.env['SS_DEV'] && 'coffee' || 'js'), 'utf8');
      client.assets.add('mod', 'socketstream-events', code, {
        coffee: process.env['SS_DEV']
      });
      client.assets.add('code', 'init', "require('socketstream-events');");
      return {
        /* RETURN API
        */
        server: {
          websocket: function(obj, send, meta) {
            var msg;
            msg = JSON.stringify(obj);
            return send(messagePrefix + '|' + msg);
          }
        }
      };
    }
  };
};
