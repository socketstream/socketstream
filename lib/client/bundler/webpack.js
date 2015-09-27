// Webpack bundler implementation
'use strict';

//var fs = require('fs'),
//  path = require('path'),
//  log = require('../../utils/log');

/**
 * @typedef { name:string, path:string, dir:string, content:string, options:string, type:string } AssetEntry
 */

/**
 * @ngdoc service
 * @name bundler.webpack:webpack
 * @function
 *
 * @description
 *  The webpack bundler of HTML, CSS & JS
 *
 *  This is just for demonstration purposes and to validate the custom bundler concept. It can be improved.
 */
module.exports = function(webpack) {
  return function(ss, client /*,options*/){
    var bundler = ss.bundler.create({
      define: define,
      entries: entries,

      asset: {
        html: assetHTML,
        loader: assetLoader,
        systemModule: systemModule,
        js: assetJS,
        worker: assetWorker,
        start: assetStart,
        css: assetCSS
      }
    });

    /**
     *
     * @param client
     * @param paths
     * @returns {*}
     */
    function define(paths) {

      if (typeof paths.view !== 'string') {
        throw new Error('You may only define one HTML view per single-page client. Please pass a filename as a string, not an Array');
      }
      if (paths.view.indexOf('.') === -1) {
        throw new Error('The \'' + paths.view + '\' view must have a valid HTML extension (such as .html or .jade)');
      }

      // Define new client object
      client.paths = ss.bundler.sourcePaths(paths);
    }

    /**
     * @ngdoc method
     * @name bundler.webpack:default#entries
     * @methodOf bundler.webpack:webpack
     * @function
     * @description
     * Provides the view and the pack functions with a
     * list of entries for an asset type relative to the client directory.
     *
     * @param {String} assetType js/css/tmpl
     * @param {Object} systemAssets Collection of libs, modules, initCode
     * @returns {[AssetEntry]} List of output entries
     */
    function entries(assetType) {
      return ss.bundler.entries(bundler.client, assetType);
    }

    /**
     *
     * @param path
     * @param opts
     * @param cb
     * @returns {*}
     */
    function assetCSS(path, opts, cb) {
      return ss.bundler.loadFile({file:path, ext:'css'}, opts, null, cb);
    }

    /**
     *
     * @param path
     * @param opts
     * @param cb
     * @returns {*}
     */
    function assetHTML(path, opts, cb) {
      return ss.bundler.loadFile({file:path, ext:'html'}, opts, null, cb);
    }

    /**
     *
     * @param cb
     */
    function assetLoader() {
      return { type: 'loader', names: [], content: ';/* loader */' };
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
        //case "eventemitter2":
        //case "socketstream":
        default:
          //if (client.includes.system) {
            return ss.bundler.systemModule(name)
          //}
      }
    }


    /**
     *
     * @param path
     * @param opts
     * @param cb
     */
    function assetJS(path, opts, cb) {
      webpack({}, function() {
        cb('//');
      });

    }

    /**
     *
     * @param cb
     * @returns {*}
     */
    function assetStart() {
      var output = ss.bundler.startCode(bundler.client);
      return output;
    }

    /**
     *
     * @param path
     * @param opts
     * @param cb
     */
    function assetWorker(path, opts, cb) {
      webpack({}, function() {
        cb('//');
      });
    }

    return bundler;
  };

};

