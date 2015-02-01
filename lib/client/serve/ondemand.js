'use strict';

// Serve Assets On Demand
// ----------------------
// Serves assets to browsers on demand, caching responses in production mode

require('colors');

var url = require('url'),
    qs = require('querystring'),
    pathlib = require('path'),
    magicPath = require('../magic_path'),
    log = require('../../utils/log'),
    utils = require('./utils');

// When packing assets, cache responses to each query in RAM to avoid
// having to re-compile and minify assets. TODO: Add limits/purging
var queryCache = {};

module.exports = function(ss, router, options) {
  function serve(processor) {
    return function(request, response) {
      var path = utils.parseUrl(request.url);
      if (options.packAssets && queryCache[path]) {
        return utils.serve.js(queryCache[path], response);
      } else {
        return processor(request, response, path, function(output) {
          queryCache[path] = output;
          return utils.serve.js(output, response);
        });
      }
    };
  }

  // Async Code Loading  
  function code(request, response, path, cb) {
    var output = [],
        thisUrl = url.parse(request.url),
        params = qs.parse(thisUrl.query),
        dir = pathlib.join(ss.root, options.dirs.client),
        files = magicPath.files(dir, [path]);

    return files.forEach(function(file) {
      var description;
      try {
        return bundler.get(ss,params,options).asset.js(file, {
          client: params.client,
          clientId: params.ts,
          pathPrefix: options.globalModules? null : path,
          compress: options.packAssets
        }, function(js) {
          output.push(js);
          if (output.length === files.length) {  // last file
            return cb(output.join('\n'));
          }
        });
      } catch (e) {
        description = e.stack && e.stack.split('\n')[0] || 'Unknown Error';
        return log.error(('! Unable to load ' + file + ' on demand:').red, description);
      }
    });
  }

  // Web Workers
  function worker(request, response, path, cb) {
    var thisUrl = url.parse(request.url),
      params = qs.parse(thisUrl.query);

    return bundler.get(ss,params,options).asset.worker(path, {
      compress: options.packAssets
    }, cb);
  }

  // Bind to routes  
  router.on('/_serve/code?*', serve(code));
  return router.on('/_serve/worker?*', serve(worker));
};

