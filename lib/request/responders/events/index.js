var fs, messagePrefix;

fs = require('fs');

messagePrefix = 'event';

exports.init = function(ss, config) {
  return {
    messagePrefix: messagePrefix,
    load: function() {
      var code;
      code = fs.readFileSync(__dirname + '/client.' + (process.env['SS_DEV'] && 'coffee' || 'js'), 'utf8');
      ss.client.send('mod', 'socketstream-events', code, {
        coffee: process.env['SS_DEV']
      });
      ss.client.send('code', 'init', "require('socketstream-events');");
      return {
        /* RETURN SERVER API
        */
        websocket: function(obj, send, meta) {
          var msg;
          msg = JSON.stringify(obj);
          return send(messagePrefix + '|' + msg);
        }
      };
    }
  };
};
