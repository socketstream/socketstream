'use strict';

var fs = require('fs');

/**
 * Javascript formatter
 */
module.exports = function(ss) {
  return {
    extensions: ['js'],
    assetType: 'js',
    contentType: 'text/javascript; charset=utf-8',
    compile: function(path, options, cb) {
      ss.log.trace('Compiling plain JS',path,options);
      //TODO if no file, return error object
      return cb(fs.readFileSync(path, 'utf8'));
    }
  };
};
