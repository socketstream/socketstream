var coffee, fs, messagePrefix;

fs = require('fs');

if (process.env['SS_DEV']) coffee = require('coffee-script');

messagePrefix = 'tel';

exports.init = function(root, session, extensions, config) {
  return {
    messagePrefix: messagePrefix,
    load: function() {
      return {
        server: require('./server').init(root, messagePrefix, extensions),
        client: {
          code: function() {
            var cs;
            cs = fs.readFileSync(__dirname + '/client.coffee', 'utf8');
            return coffee.compile(cs);
          }
        }
      };
    }
  };
};
