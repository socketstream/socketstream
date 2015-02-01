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
    }
  };

  return bundler;

  function define(paths) {

    if (typeof paths.view !== 'string') {
      throw new Error('You may only define one HTML view per single-page client. Please pass a filename as a string, not an Array');
    }
    if (paths.view.indexOf('.') === -1) {
      throw new Error('The \'' + paths.view + '\' view must have a valid HTML extension (such as .html or .jade)');
    }

    // Define new client object
    client.paths = ss.bundler.sourcePaths(ss,paths,options);
    client.includes = includeFlags(paths.includes);

    return ss.bundler.destsFor(ss,client,options);
	}

  function load() {

  }

  function assetJS(path, opts, cb) {
    return ss.bundler.loadFile(ss, options.dirs.client, path, 'js', opts, function(output) {
      output = ss.bundler.wrapCode(output, path, opts.pathPrefix, options);
      if (opts.compress && path.indexOf('.min') === -1) {
        output = ss.bundler.minifyJSFile(output, path);
      }
      return cb(output);
    });
  }
  function assetWorker(path, opts, cb) {
    return ss.bundler.loadFile(ss, options.dirs.client, path, 'js', opts, function(output) {
      if (opts.compress) {
        output = ss.bundler.minifyJSFile(output, path);
      }
      return cb(output);
    });
  }

  function assetCSS(path, opts, cb) {
    return ss.bundler.loadFile(ss, options.dirs.client, path, 'css', opts, cb);
  }

  function assetHTML(path, opts, cb) {
    return ss.bundler.loadFile(ss, options.dirs.client, path, 'html', opts, cb);
  }

  function packJS(postProcess) {
    ss.bundler.packAssetSet('js', options.dirs.client, client, bundler, postProcess);
  }

  function packCSS(postProcess) {
    ss.bundler.packAssetSet('css', options.dirs.client, client, bundler, postProcess);
  }
};

