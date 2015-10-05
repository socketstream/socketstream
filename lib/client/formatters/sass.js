'use strict';

module.exports = function(ss, config) {

  var sass = ss.require('node-sass');

  return {

    name: 'Sass',

    extensions: ['sass', 'scss'],

    assetType: 'css',

    contentType: 'text/css',

    compile: function(srcPath, options, success, error) {

      var opts = { file: srcPath };
      for(var n in config) { opts[n] = opts[n] || config[n]; }
      opts.locals = opts.locals || options.locals;
      opts.outputStyle = options.compress? "compressed":"nested";

      sass.render(opts, function(err, result) {
        if (err) {
          console.log(err)
          return error(err);
        }
        success(result.css.toString());
        //TODO result.stats print
        //TODO result.map.toString
      });
    }
  };
};
