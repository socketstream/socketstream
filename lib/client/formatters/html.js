// Plain HTML Formatter
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

      // If passing optional headers for main view
      if (options && options.headers) {
        input = input.replace('<SocketStream>', options.headers);
        input = input.replace('<SocketStream/>', options.headers);
      }
      return cb(input);
    }
  };
};
