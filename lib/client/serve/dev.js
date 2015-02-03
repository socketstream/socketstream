// Serve Assets in Development
// ---------------------------
// Serves all code and other assets when you DON'T call ss.client.packAssets()
'use strict';

var url     = require('url'),
    qs      = require('querystring'),
    system  = require('../system'),
    utils   = require('./utils');

// Expose asset server as the public API
//
module.exports = function (ss, router, options) {

  var bundler = require('../bundler/index')(ss,options);

  // JAVASCRIPT  

  // Serve system libraries and modules
  router.on('/_serveDev/system?*', function(request, response) {
    return utils.serve.js(system.serve.js(), response);
  });

  // Listen for requests for application client code  
  router.on('/_serveDev/code?*', function(request, response) {
    var thisUrl = url.parse(request.url),
      params = qs.parse(thisUrl.query),
      path = utils.parseUrl(request.url);

    return bundler.get(params).asset.js(path, {
      client: params.client,
      clientId: params.ts,
      pathPrefix: params.pathPrefix
    }, function(output) {
      return utils.serve.js(output, response);
    });
  });
  router.on('/_serveDev/start?*', function(request, response) {
    var thisUrl = url.parse(request.url),
      params = qs.parse(thisUrl.query);

    bundler.get(params).asset.launch(function(output) {
      return utils.serve.js(output, response);
    });

  });

  // CSS

  // Listen for requests for CSS files  
  return router.on('/_serveDev/css?*', function(request, response) {
    var params, path, thisUrl;
    thisUrl = url.parse(request.url);
    params = qs.parse(thisUrl.query);
    path = utils.parseUrl(request.url);
    return bundler.get(params).asset.css(path, {
      client: params.client,
      clientId: params.ts
    }, function(output) {
      return utils.serve.css(output, response);
    });
  });
};
