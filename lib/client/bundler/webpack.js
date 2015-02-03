// Webpack bundler implementation
'use strict';

var fs = require('fs'),
  path = require('path'),
  log = require('../../utils/log');

module.exports = function(webpack) {
  return function(ss,options){
    var bundler = {
      define: define,
      load: load,
      pack: {
        js: packJS,
        css: packCSS
      },
      asset: {
        html: assetHTML,
        js: assetJS,
        worker: assetWorker,
        launch: assetLaunch,
        css: assetCSS
      }
    };
    return bundler;

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
      client.includes = {}; //TODO post-define default?

      return ss.bundler.destsFor(client);
    }

    function load() {

    }

    function assetCSS(path, opts, cb) {
      return ss.bundler.loadFile(options.dirs.client, path, 'css', opts, cb);
    }

    function assetHTML(path, opts, cb) {
      return ss.bundler.loadFile(options.dirs.client, path, 'html', opts, cb);
    }

    function assetJS(path, opts, cb) {
      webpack({}, function() {
        cb('//');
      });

    }

    function assetLaunch(cb) {
      var output = ss.bundler.launchCode(client);
      return cb(output);
    }

    function assetWorker(path, opts, cb) {
      webpack({}, function() {
        cb('//');
      });

    }

    function packCSS(postProcess) {
      ss.bundler.packAssetSet('css', options.dirs.client, bundler.client, bundler, postProcess);
    }

    function packJS() {

    }
  };

};

