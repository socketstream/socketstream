// Default bundler implementation
'use strict';

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


module.exports = function(ss,client,options){
  var bundler = {
    define: define,
    load: load,
    asset: {
      js: assetJS,
      worker: assetWorker,
      css: assetCSS,
      html: assetHTML
    },
    pack: {
      js: packJS,
      css: packCSS
    },
    ensureAssetFolder: ensureAssetFolder
  };

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
    this.description = ss.bundler.descriptionFor(ss,client,options);
  }

  function assetJS(path, opts, cb) {
    return ss.bundler.loadFile(ss, options.dirs.code, path, 'js', opts, function(output) {
      output = ss.bundler.wrapCode(output, path, opts.pathPrefix, options);
      if (opts.compress && path.indexOf('.min') === -1) {
        output = ss.bundler.minifyJSFile(output, path);
      }
      return cb(output);
    });
  }
  function assetWorker(path, opts, cb) {
    return ss.bundler.loadFile(ss, options.dirs.workers, path, 'js', opts, function(output) {
      if (opts.compress) {
        output = ss.bundler.minifyJSFile(output, path);
      }
      return cb(output);
    });
  }

  function assetCSS(path, opts, cb) {
    return ss.bundler.loadFile(ss, options.dirs.css, path, 'css', opts, cb);
  }

  function assetHTML(path, opts, cb) {
    return ss.bundler.loadFile(ss, options.dirs.views, path, 'html', opts, cb);
  }

  function packJS(postProcess) {
    ss.bundler.packAssetSet('js', options.dirs.code, client, bundler, postProcess);
  }

  function packCSS(postProcess) {
    ss.bundler.packAssetSet('css', options.dirs.css, client, bundler, postProcess);
  }

  //TODO move to index.js
  function ensureAssetFolder() {

    // Prepare folder
    mkdir(this.description.containerDir);
    mkdir(this.description.dir);
    if (!(options.packedAssets && options.packedAssets.keepOldFiles)) {
      deleteOldFiles(this.description.dir);
    }
  }
};

