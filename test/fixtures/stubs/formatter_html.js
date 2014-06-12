/**
 * Plain HTML Formatter
 */

"use strict"

var fs;

fs = require('fs');

exports.init = function() {
  return {
    extensions: ['html'],
    assetType: 'html',
    contentType: 'text/html',
    compile: function(path, options, cb) {
      var input;
      input = fs.readFileSync(path, 'utf8');
      return cb(input);
    }
  };
};
