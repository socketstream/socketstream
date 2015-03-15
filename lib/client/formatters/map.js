// JS Minmap formatter
//
// courtesy of Waxolunist (gh)
//
'use strict';



// Dependencies
//
var fs = require('fs');

module.exports = function(ss) {

  return {
    extensions: ['map'],
    assetType: 'js',
    contentType: 'application/json',
    compile: function(path, options, cb) {
      ss.log.trace('Compiling plain MAP',path,options);
      return cb(fs.readFileSync(path, 'utf8'));
    }
  };

};
