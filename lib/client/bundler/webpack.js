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

      return ss.bundler.destsFor(ss,client,options);
    }

    function load() {

    }

    function assetCSS(path, opts, cb) {
      return ss.bundler.loadFile(ss, options.dirs.css, path, 'css', opts, cb);
    }

    function assetHTML(path, opts, cb) {
      return ss.bundler.loadFile(ss, options.dirs.views, path, 'html', opts, cb);
    }

    function assetJS(path, opts, cb) {
      webpack({}, function() {
        cb('//');
      });

    }

    function assetWorker(path, opts, cb) {
      webpack({}, function() {
        cb('//');
      });

    }

    function packCSS(postProcess) {
      ss.bundler.packAssetSet('css', options.dirs.css, client, bundler, postProcess);
    }

    function packJS() {

    }
  };

};

