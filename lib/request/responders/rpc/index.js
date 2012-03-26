var fs, messagePrefix;

fs = require('fs');

messagePrefix = 'rpc';

exports.init = function(root, ss, client, config) {
  return {
    messagePrefix: messagePrefix,
    load: function(middleware) {
      var code, request;
      request = require('./handler').init(root, messagePrefix, middleware, ss);
      code = fs.readFileSync(__dirname + '/client.' + (process.env['SS_DEV'] && 'coffee' || 'js'), 'utf8');
      client.assets.add('mod', 'socketstream-rpc', code, {
        coffee: process.env['SS_DEV']
      });
      client.assets.add('code', 'init', "require('socketstream-rpc');");
      return {
        /* RETURN API
        */
        server: require('./interfaces').init(request, messagePrefix)
      };
    }
  };
};
