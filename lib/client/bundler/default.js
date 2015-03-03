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

/**
 * @typedef { name:string, path:string, dir:string, content:string, options:string, type:string } AssetEntry
 */

/**
 * @ngdoc service
 * @name bundler.default:default
 * @function
 *
 * @description
 *  The default bundler of HTML, CSS & JS
 *
 * @type {{define: define, load: load, toMinifiedCSS: toMinifiedCSS, toMinifiedJS: toMinifiedJS, asset: {entries: entries, loader: assetLoader, systemModule: systemModule, js: assetJS, worker: assetWorker, start: assetStart, css: assetCSS, html: assetHTML}}}
 */
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

  /**
   *
   * @returns {{a: string, b: string}}
   */
  function load() {
    return {
      a:'a',
      b:'b'
    }
  }

  /**
   * @ngdoc method
   * @name bundler.default:default#entries
   * @methodOf bundler.default:default
   * @function
   * @description
   * Provides the view and the pack functions with a
   * list of entries for an asset type relative to the client directory.
   * The default implementation is used.
   *
   * @param {String} assetType js/css
   * @param {Object} systemAssets Collection of libs, modules, initCode
   * @returns {[AssetEntry]} List of output entries
   */
  function entries(assetType,systemAssets) {
    return ss.bundler.entries(client, assetType, systemAssets);
  }

  /**
   * @ngdoc method
   * @name bundler.default:default#assetLoader
   * @methodOf bundler.default:default
   * @function
   * @description
   * Return entry for the JS loader depending on the includes.system client config.
   *
   * @returns {AssetEntry} Loader resource
   */
  function assetLoader() {
    return client.includes.system? ss.bundler.systemLibs() : null;
  }

  /**
   * @ngdoc method
   * @name bundler.default:default#systemModule
   * @methodOf bundler.default:default
   * @function
   * @description
   * Return the resource for a registered system module by the given name. It uses
   * the default wrapCode for module registration with require.
   *
   * @param {String} name Logical Module Name
   * @returns {AssetEntry} Module resource
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
   * @ngdoc method
   * @name bundler.default:default#assetStart
   * @methodOf bundler.default:default
   * @function
   * @description
   * Return the resource for starting the view. It is code for immediate execution at the end of the page.
   *
   * @returns {AssetEntry} Start Script resource
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

