"use strict";

var fs = require('fs');

/**
 * Plain CSS Formatter
 */
exports.init = function() {
  return {
    extensions: ['css'],
    assetType: 'css',
    contentType: 'text/css',
    compile: function(path, options, cb) {
      return cb(fs.readFileSync(path, 'utf8'));
    }
  };
};
