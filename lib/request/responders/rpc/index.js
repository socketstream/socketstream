var fs, messagePrefix;

fs = require('fs');

messagePrefix = 'rpc';

exports.init = function(ss, config) {
  return {
    messagePrefix: messagePrefix,
    load: function(middleware) {
      var code, request;
      request = require('./handler').init(ss, messagePrefix, middleware);
      code = fs.readFileSync(__dirname + '/client.' + (process.env['SS_DEV'] && 'coffee' || 'js'), 'utf8');
      ss.client.send('mod', 'socketstream-rpc', code, {
        coffee: process.env['SS_DEV']
      });
      ss.client.send('code', 'init', "require('socketstream-rpc');");
      return require('./interfaces').init(request, messagePrefix);
    }
  };
};
