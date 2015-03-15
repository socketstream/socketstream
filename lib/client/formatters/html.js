'use strict';

var fs = require('fs');

/**
 * Plain HTML Formatter
 */
module.exports = function(ss) {
  return {
    extensions: ['html'],
    assetType: 'html',
    contentType: 'text/html',
    compile: function(path, options, cb) {
      ss.log.trace('Compiling plain HTML',path,options);
      var input;
      input = fs.readFileSync(path, 'utf8');

      // If passing optional headers for main view
      if (options && options.headers) {
        input = input.replace('<SocketStream>', options.headers);
        input = input.replace('<SocketStream/>', options.headers);
      }
      return cb(input);
    }
  };
};
