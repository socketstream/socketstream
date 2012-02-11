var coffee, fs, messagePrefix;

fs = require('fs');

if (process.env['SS_DEV']) coffee = require('coffee-script');

messagePrefix = 'event';

exports.init = function(root, ss, config) {
  return {
    messagePrefix: messagePrefix,
    load: function() {
      return {
        server: {
          request: function(obj, send, meta) {
            var msg;
            msg = JSON.stringify(obj);
            return send(messagePrefix + '§' + msg);
          }
        },
        client: {
          code: function() {
            var extension, input;
            extension = (coffee != null) && 'coffee' || 'js';
            input = fs.readFileSync(__dirname + '/client.' + extension, 'utf8');
            return (coffee != null) && coffee.compile(input) || input;
          }
        }
      };
    }
  };
};
