'use strict';

var path = require('path'),
    findup = require('findup-sync');

module.exports = function(ss, config, clientOptions) {

  var sass = ss.require('node-sass'),
      modulesPath = [ findup('node_modules') ]; //TODO get real npm and bower package locations

  console.log(  );

  return {

    name: 'Sass',

    extensions: ['sass', 'scss'],

    assetType: 'css',

    contentType: 'text/css',

    compile: function(srcPath, options, success, error) {

      var opts = {
        file: srcPath,
        includePaths: modulesPath.concat([ path.join(ss.root, clientOptions.dirs.client) ])
      };
      for(var n in config) {
        if (n !== 'file') {
          opts[n] = config[n] || opts[n];
        }
      }
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
