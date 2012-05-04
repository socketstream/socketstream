var magicPath, pathlib, queryCache, utils;

pathlib = require('path');

magicPath = require('../magic_path');

utils = require('./utils');

queryCache = {};

module.exports = function(ss, router, options) {
  var asset, code, serve, worker;
  asset = require('../asset')(ss, options);
  serve = function(processor) {
    return function(request, response) {
      var path;
      if (options.packAssets && queryCache[request.url]) {
        return utils.serve.js(queryCache[request.url], response);
      } else {
        path = utils.parseUrl(request.url);
        return processor(request, response, path, function(output) {
          queryCache[request.url] = output;
          return utils.serve.js(output, response);
        });
      }
    };
  };
  code = function(request, response, path, cb) {
    var dir, files, output;
    output = [];
    dir = pathlib.join(ss.root, options.dirs.code);
    files = magicPath.files(dir, [path]);
    return files.forEach(function(file) {
      return asset.js(file, {
        pathPrefix: path,
        compress: options.packAssets
      }, function(js) {
        output.push(js);
        if (output.length === files.length) return cb(output.join("\n"));
      });
    });
  };
  worker = function(request, response, path, cb) {
    return asset.worker(path, {
      compress: options.packAssets
    }, cb);
  };
  router.on('/_serve/code?*', serve(code));
  return router.on('/_serve/worker?*', serve(worker));
};
