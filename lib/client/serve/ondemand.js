'use strict';

// Serve Assets On Demand
// ----------------------
// Serves assets to browsers on demand, caching responses in production mode

require('colors');

var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
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
  function code(request, response, from, cb) {
    var output = [],
        p = fs.statSync(path.join(ss.client.dirs.code,from)).isFile()? from : path.join(from,'**','*'),
        files = glob.sync(p, {cwd: ss.client.dirs.code}); //TODO entries

    return files.forEach(function(file) {
      var description;
      try {
        var opts = {
          compress: options.packAssets
        },
        entry = ss.bundler.entryFor('js',options.dirs.code.substring(1),p);

        ss.bundler.loadFile(entry, opts, null, function(js) {
          output.push(js);
          if (output.length === files.length) {  // last file
            return cb(output.join('\n'));
          }
        }, function(err) {
          ss.log.clientIssue({name:'unknown','id':'unknown'},options,err,entry);
          cb('console.log("error","'+ err.userInfoText +'")');
        });

      } catch (e) {
        description = e.stack && e.stack.split('\n')[0] || 'Unknown Error';
        return ss.log.error(('! Unable to load ' + file + ' on demand:').red, description);
      }
    });
  }

  // Web Workers
  function worker(request, response, path, cb) {
    var entry = ss.bundler.entryFor('worker',options.dirs.workers.substring(1),path),
        opts = {
          //TODO packAssets vs packedAssets
          compress: options.packAssets
        };

    ss.bundler.loadFile(entry, opts, null, cb, function(err) {
      ss.log.clientIssue({name:'unknown','id':'unknown'},options,err,entry);
      cb('console.log("error","'+ err.userInfoText +'")');
    });
  }

  // Bind to routes
  router.on('/_serve/code?*', serve(code));
  return router.on('/_serve/worker?*', serve(worker));
};

