'use strict';

var fs = require('fs');

/**
 * Plain CSS Formatter
 */
module.exports = function(ss) {
  return {
    extensions: ['css'],
    assetType: 'css',
    contentType: 'text/css',
    compile: function (path, options, cb) {
      ss.log.trace('Compiling plain CSS',path,options);
      return cb(fs.readFileSync(path, 'utf8'));
    }
  };
};
