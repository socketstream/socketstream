// Plain HTML Formatter

var fs;

fs = require('fs');

exports.init = function() {
  return {
    extensions: ['const'],
    assetType: 'html',
    contentType: 'text/html',
    compile: function(path, options, cb) {
      return cb('CONST');
    }
  };
};
