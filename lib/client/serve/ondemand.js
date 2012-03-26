var asset, magicPath, pathlib, queryCache, utils;

pathlib = require('path');

magicPath = require('../magic_path');

asset = require('../asset');

utils = require('./utils');

queryCache = {};

module.exports = function(root, router, packAssets) {
  var code, serve, worker;
  serve = function(processor) {
    return function(request, response) {
      var path;
      if (packAssets && queryCache[request.url]) {
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
    dir = pathlib.join(root, 'client/code');
    files = magicPath.files(dir, [path]);
    return files.forEach(function(file) {
      return asset.js(root, file, {
        pathPrefix: path,
        compress: packAssets
      }, function(js) {
        output.push(js);
        if (output.length === files.length) return cb(output.join("\n"));
      });
    });
  };
  worker = function(request, response, path, cb) {
    return asset.worker(root, path, {
      compress: packAssets
    }, cb);
  };
  router.on('/_serve/code?*', serve(code));
  return router.on('/_serve/worker?*', serve(worker));
};
