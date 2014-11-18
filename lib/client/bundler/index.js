function includeFlags(overrides) {
  var includes = {
    css: true,
    html: true,
    system: true,
    initCode: true
  };
  if (overrides) {
    for(var n in overrides) { includes[n] = overrides[n]; }
  }
  return includes;
}


module.exports = function bundler(ss,options){
  var pack = require('./pack')(ss,options);

  return {

	  define: function define(client, paths) {

      if (typeof paths.view !== 'string') {
        throw new Error('You may only define one HTML view per single-page client. Please pass a filename as a string, not an Array');
      }
      if (paths.view.indexOf('.') === -1) {
        throw new Error('The \'' + paths.view + '\' view must have a valid HTML extension (such as .html or .jade)');
      }

      // Alias 'templates' to 'tmpl'
      if (paths.templates) {
        paths.tmpl = paths.templates;
      }

      // Force each into an array
      ['css', 'code', 'tmpl'].forEach(function(assetType) {
        if (!(paths[assetType] instanceof Array)) {
          paths[assetType] = [paths[assetType]];
          return paths[assetType];
        }
      });

      // Define new client object
      client.paths = paths;
      client.includes = includeFlags(paths.includes);

      return client;
  	},

    packCSS: pack.css,
    packJS: pack.js,

    load: function load() {
      //TODO something
    }
  };
};