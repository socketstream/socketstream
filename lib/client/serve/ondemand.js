'use strict';

// Serve Assets On Demand
// ----------------------
// Serves assets to browsers on demand, caching responses in production mode

var magicPath, pathlib, queryCache, utils;

require('colors');

pathlib = require('path');

magicPath = require('../magic_path');

utils = require('./utils');

// When packing assets, cache responses to each query in RAM to avoid
// having to re-compile and minify assets. TODO: Add limits/purging
queryCache = {};

module.exports = function(ss, router, options) {
  var asset, code, serve, worker;
  asset = require('../asset')(ss, options);
  serve = function(processor) {
    return function(request, response) {
      var path;
      path = utils.parseUrl(request.url);
      if (options.packAssets && queryCache[path]) {
        return utils.serve.js(queryCache[path], response);
      } else {
        return processor(request, response, path, function(output) {
          queryCache[path] = output;
          return utils.serve.js(output, response);
        });
      }
    };
  };

  // Async Code Loading  
  code = function(request, response, path, cb) {
    var dir, files, output;
    output = [];
    dir = pathlib.join(ss.root, options.dirs.code);
    files = magicPath.files(dir, [path]);
    return files.forEach(function(file) {
      var description;
      try {
        return asset.js(file, {
          pathPrefix: path,
          compress: options.packAssets
        }, function(js) {
          output.push(js);
          if (output.length === files.length) {  // last file
            return cb(output.join('\n'));
          }
        });
      } catch (e) {
        description = e.stack && e.stack.split('\n')[0] || 'Unknown Error';
        return ss.log(('! Unable to load ' + file + ' on demand:').red, description);
      }
    });
  };

  // Web Workers
  worker = function(request, response, path, cb) {
    return asset.worker(path, {
      compress: options.packAssets
    }, cb);
  };

  // Bind to routes  
  router.on('/_serve/code?*', serve(code));
  return router.on('/_serve/worker?*', serve(worker));
};