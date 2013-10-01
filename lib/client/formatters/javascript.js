// Javascript formatter
'use strict';


// Dependencies
//
var fs = require('fs');



exports.init = function() {
  return {
    extensions: ['js'],
    assetType: 'js',
    contentType: 'text/javascript; charset=utf-8',
    compile: function(path, options, cb) {
      return cb(fs.readFileSync(path, 'utf8'));
    }
  };
};