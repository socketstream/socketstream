'use strict';

// Serve Assets On Demand
// ----------------------
// Serves assets to browsers on demand, caching responses in production mode

require('colors');
var pathlib   = require('path');
var magicPath = require('../magic_path');
var utils     = require('./utils');

// When packing assets, cache responses to each query in RAM to avoid
// having to re-compile and minify assets. TODO: Add limits/purging
var queryCache = {};

module.exports = function(ss, router, options) {

    var asset = require('../asset')(ss, options);

    var serve = function(processor) {
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
    };

    // Async Code Loading
    var code = function(request, response, path, cb) {
        var output = [];
        var dir = pathlib.join(ss.root, options.dirs.code);
        var files = magicPath.files(dir, [path]);
        return files.forEach(function(file) {
            try {
                return asset.js(file, {
                    pathPrefix  : path,
                    compress    : options.packAssets
                }, function(js) {
                    output.push(js);
                    if (output.length === files.length) { // last file
                        return cb(output.join('\n'));
                    }
                });
            } catch (e) {
                var description = e.stack && e.stack.split('\n')[0] || 'Unknown Error';
                return ss.log(('! Unable to load ' + file + ' on demand:').red, description);
            }
        });
    };

    // Web Workers
    var worker = function(request, response, path, cb) {
        return asset.worker(path, {
            compress: options.packAssets
        }, cb);
    };

    // Bind to routes  
    router.on('/_serve/code?*', serve(code));
    return router.on('/_serve/worker?*', serve(worker));
};
