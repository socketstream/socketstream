var coffee, fs, messagePrefix;

fs = require('fs');

if (process.env['SS_DEV']) coffee = require('coffee-script');

messagePrefix = 'rpc';

exports.init = function(root, ss, config) {
  return {
    messagePrefix: messagePrefix,
    load: function(middleware) {
      return {
        server: require('./server').init(root, messagePrefix, middleware, ss),
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
