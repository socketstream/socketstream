// Default bundler implementation
'use strict';

var fs = require('fs'),
    path = require('path'),
    log = require('../../utils/log'),
    systemAssets = require('../system').assets;

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
    toMinifiedCSS: toMinifiedCSS,
    toMinifiedJS: toMinifiedJS,
    asset: {
      includeSystemLib: includeSystemLib,
      includeSystemModule: includeSystemModule,
      entries: entries,
      js: assetJS,
      worker: assetWorker,
      launch: assetLaunch,
      css: assetCSS,
      html: assetHTML
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
    client.paths = ss.bundler.sourcePaths(paths);
    client.includes = includeFlags(paths.includes);

    return ss.bundler.destsFor(client);
	}

  function load() {

  }

  function includeSystemLib(name,content,options) {
    switch(name) {
      case "browserify":
    }
    return true;
  }

  function includeSystemModule(name,content,options) {
    switch(name) {
      case "eventemitter2":
      case "socketstream":
    }
    return true;
  }

  // list of entries for an asset type relative to the client directory
  function entries(assetType) {
    return ss.bundler.entries(client, assetType);
  }

  function assetJS(path, opts, cb) {
    return ss.bundler.loadFile(options.dirs.client, path, 'js', opts, function(output) {
      //TODO with options compress saved to avoid double compression
      output = ss.bundler.wrapCode(output, path, opts.pathPrefix);
      if (opts.compress && path.indexOf('.min') === -1) {
        output = ss.bundler.minifyJSFile(output, path);
      }
      return cb(output);
    });
  }
  function assetWorker(path, opts, cb) {
    return ss.bundler.loadFile(options.dirs.client, path, 'js', opts, function(output) {
      if (opts.compress) {
        output = ss.bundler.minifyJSFile(output, path);
      }
      return cb(output);
    });
  }

  function assetLaunch() {
    return ss.bundler.launchCode(client);
  }

  function assetCSS(path, opts, cb) {
    return ss.bundler.loadFile(options.dirs.client, path, 'css', opts, cb);
  }

  function assetHTML(path, opts, cb) {
    return ss.bundler.loadFile(options.dirs.client, path, 'html', opts, cb);
  }

  function toMinifiedCSS(files) {
    return ss.bundler.minifyCSS(files);
  }

  function toMinifiedJS(files) {
    // Libs
    var libs = systemAssets.libs.map(function(lib) {
      return bundler.asset.includeSystemLib(lib.name, lib.content, lib.options)? lib : null;
    }).filter(function(content) {
      return !!content;
    });

    // Modules
    var mods = [],
      _ref = systemAssets.modules;
    for (var name in _ref) {
      if (_ref.hasOwnProperty(name)) {
        var mod = _ref[name];
        if (bundler.asset.includeSystemModule(mod.name,mod.content,mod.options)) {
          var code = ss.bundler.wrapModule(name, mod.content);
          mods.push({ name:mod.name, content:code,options:mod.options,type:mod.type });
        }
      }
    }

    var initCode = bundler.asset.launch();
    if (initCode) {
      //parts.push(initCode);
    }
    return ss.bundler.minifyJS(libs.concat(mods).concat(files).concat(systemAssets.initCode));
  }
};

