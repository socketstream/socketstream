var fs;

fs = require('fs');

exports.init = function() {
  return {
    extensions: [],
    assetType: null,
    compile: function(path, options, cb) {
      var input;
      input = fs.readFileSync(path, 'utf8');
      return cb(input);
    }
  };
};
