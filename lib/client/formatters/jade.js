'use strict';

var fs = require('fs'),
    path = require('path');

module.exports = function(ss, config, clientOptions) {
  config = config || {};
  if (!config.basedir) {
    config.basedir = path.join(ss.root, clientOptions.dirs.client);
  }
  
  var jade = ss.require('jade');

  return {

    name: 'Jade',
    extensions: ['jade'],
    assetType: 'html',
    contentType: 'text/html',

    compile: function(path, options, cb) {

      var locals = {};

      // Merge any locals passed to config.locals
      if (options.locals && typeof(options.locals) === 'object') {
        for (var attrname in options.locals) { locals[attrname] = options.locals[attrname]; }
      }

      // If passing optional headers for main view HTML
      if (options && options.headers) {
        locals.SocketStream = options.headers;
      }

      var input = fs.readFileSync(path, 'utf8');
      var parser = jade.compile(input, Object.create(config, {
        filename: {value:path}
      }) );
      var output = parser(locals);

      cb(output);
    }
  };
};
