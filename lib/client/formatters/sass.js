'use strict';

module.exports = function(ss, config) {

  var sass = ss.require('node-sass');

  return {

    name: 'Sass',

    extensions: ['sass', 'scss'],

    assetType: 'css',

    contentType: 'text/css',

    compile: function(path, options, cb) {

      var success = function(css) {
        cb(css);
      };

      var error = function (err) {
        console.log('! - Unable to compile Sass file %s into CSS', path);
        console.log(err);
      };

      var opts = {
        file: path,
        success: success,
        error: error
      };
      for(var n in config) { opts[n] = opts[n] || config[n]; }
      opts.locals = opts.locals || options.locals;
      opts.outputStyle = options.compress? "compressed":"nested";
      sass.render(opts);
    }
  };
};
