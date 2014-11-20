// Default bundler implementation

var fs = require('fs'), 
    path = require('path'),
    log = require('../../utils/log');


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

function deleteOldFiles(clientDir) {
  var filesDeleted, numFilesDeleted;
  numFilesDeleted = 0;
  filesDeleted = fs.readdirSync(clientDir).map(function(fileName) {
    return fs.unlinkSync(path.join(clientDir, fileName));
  });
  return filesDeleted.length > 1 && log('✓'.green, '' + filesDeleted.length + ' previous packaged files deleted');
}

function mkdir(dir) {
  if (!fs.existsSync(dir)) {
    return fs.mkdirSync(dir);
  }
}


module.exports = function bundler(ss,client,options){
  var bundler = {
    define: define,
    load: load,
    ensureAssetFolder: ensureAssetFolder
  };

  bundler.pack = require('./pack')(ss,client,bundler,options);
  bundler.asset = require('./asset')(ss,options);

  return bundler;

  function define(paths) {

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
	}

  function load() {
    var containerDir = path.join(ss.root, options.dirs.assets);
    var clientDir = path.join(containerDir, client.name);

    this.description = {

      //TODO perhaps mixin the abs versions by SS
      paths: {
        html: path.join(clientDir, client.id + '.html'),
        js: path.join(clientDir, client.id + '.js'),
        css: path.join(clientDir, client.id + '.css')
      },
      relPaths: {
        html: path.join(options.dirs.assets, client.name, client.id + '.html'),
        js: path.join(options.dirs.assets, client.name, client.id + '.js'),
        css: path.join(options.dirs.assets, client.name, client.id + '.css')
      },
      dir: clientDir,
      containerDir: containerDir
    };
  }

  function ensureAssetFolder() {

    // Prepare folder
    mkdir(this.description.containerDir);
    mkdir(this.description.dir);
    if (!(options.packedAssets && options.packedAssets.keepOldFiles)) {
      deleteOldFiles(this.description.dir);
    }
  }
};

