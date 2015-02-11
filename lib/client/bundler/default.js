// Default bundler implementation
'use strict';

var systemAssets = require('../system').assets;

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
      entries: entries,

      loader: assetLoader,
      systemModule: systemModule,
      js: assetJS,
      worker: assetWorker,
      start: assetStart,
      css: assetCSS,
      html: assetHTML
    }
  };

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

  /**
   * list of entries for an asset type relative to the client directory
   *
   * @param assetType
   * @returns {*}
   */
  function entries(assetType) {
    return ss.bundler.entries(client, assetType);
  }

  function assetLoader() {
    return client.includes.system? ss.bundler.systemLibs() : null;
  }

  /**
   *
   * @param name
   * @param content
   * @param options
   * @returns {boolean}
   */
  function systemModule(name) {
    switch(name) {
      case "eventemitter2":
      case "socketstream":
      default:
        if (client.includes.system) {
          return ss.bundler.systemModule(name)
        }
    }
  }

  /**
   *
   * @param path
   * @param opts
   * @param cb
   * @returns {*}
   */
  function assetJS(path, opts, cb) {
    return ss.bundler.loadFile(path, 'js', opts, function(output) {
      //TODO with options compress saved to avoid double compression
      output = ss.bundler.wrapCode(output, path, opts.pathPrefix);
      if (opts.compress && path.indexOf('.min') === -1) {
        output = ss.bundler.minifyJSFile(output, path);
      }
      return cb(output);
    });
  }

  /**
   *
   * @param path
   * @param opts
   * @param cb
   * @returns {*}
   */
  function assetWorker(path, opts, cb) {
    return ss.bundler.loadFile(path, 'js', opts, function(output) {
      if (opts.compress) {
        output = ss.bundler.minifyJSFile(output, path);
      }
      return cb(output);
    });
  }

  /**
   *
   * @returns {*}
   */
  function assetStart() {
    return client.includes.initCode? ss.bundler.startCode(client) : null;
  }

  /**
   *
   * @param path
   * @param opts
   * @param cb
   * @returns {*}
   */
  function assetCSS(path, opts, cb) {
    return ss.bundler.loadFile(path, 'css', opts, cb);
  }

  /**
   *
   * @param path
   * @param opts
   * @param cb
   * @returns {*}
   */
  function assetHTML(path, opts, cb) {
    return ss.bundler.loadFile(path, 'html', opts, cb);
  }

  /**
   *
   * @param files
   * @returns {*}
   */
  function toMinifiedCSS(files) {
    return ss.bundler.minifyCSS(files);
  }

  /**
   *
   * @param files
   * @returns {*}
   */
  function toMinifiedJS(files) {
    return ss.bundler.minifyJS(files);
  }

  return bundler;
};

