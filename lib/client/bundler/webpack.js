// Webpack bundler implementation
'use strict';

//var fs = require('fs'),
//  path = require('path'),
//  log = require('../../utils/log');

module.exports = function(webpack) {
  return function(ss,options){
    var bundler = {
      define: define,
      load: load,
      toMinifiedCSS: toMinifiedCSS,
      toMinifiedJS: toMinifiedJS,
      asset: {
        includeSystemLib: includeSystemLib,
        includeSystemModule: includeSystemModule,
        entries: entries,

        html: assetHTML,
        system: assetSystem,
        js: assetJS,
        worker: assetWorker,
        launch: assetLaunch,
        css: assetCSS
      }
    };

    /**
     *
     * @param client
     * @param paths
     * @returns {*}
     */
    function define(client, paths) {

      if (typeof paths.view !== 'string') {
        throw new Error('You may only define one HTML view per single-page client. Please pass a filename as a string, not an Array');
      }
      if (paths.view.indexOf('.') === -1) {
        throw new Error('The \'' + paths.view + '\' view must have a valid HTML extension (such as .html or .jade)');
      }

      bundler.client = client;

      // Define new client object
      client.paths = ss.bundler.sourcePaths(paths);

      return ss.bundler.destsFor(client);
    }

    function load() {

    }

    /**
     *
     * @param name
     * @param content
     * @param options
     * @returns {boolean}
     */
    function includeSystemLib(name) {
      switch(name) {
        case "browserify":
      }
      return true;
    }

    /**
     *
     * @param name
     * @param content
     * @param options
     * @returns {boolean}
     */
    function includeSystemModule(name) {
      switch(name) {
        case "eventemitter2":
        case "socketstream":
      }
      return true;
    }

    /**
     * list of entries for an asset type relative to the client directory
     *
     * @param assetType
     * @returns {*}
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
     * @param cb
     */
    function assetSystem(cb) {
      cb('');
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
    function assetLaunch(cb) {
      var output = ss.bundler.launchCode(bundler.client);
      return cb(output);
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
     * @returns {string}
     */
    function toMinifiedJS() {
      return '// minified JS for '+bundler.client.name;
    }

    return bundler;
  };

};

