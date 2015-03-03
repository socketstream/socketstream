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

  // JAVASCRIPT

  // Serve system libraries and modules
  router.on('/_serveDev/system?*', function(request, response) {
    var thisUrl = url.parse(request.url),
      params = qs.parse(thisUrl.query),
      moduleName = utils.parseUrl(request.url);

    // no module name (probably ts=..)
    if (moduleName.indexOf('=') >= 0) {
      var loader = ss.bundler.get(params).asset.loader() || {},
        namesComment = '/* ' + loader.names.join(',') + ' */';
      utils.serve.js(namesComment+'\n'+loader.content || '', response);
    }

    // module
    else {
      var module = ss.bundler.get(params).asset.systemModule(moduleName) || {};
      utils.serve.js(module.content || '', response);
    }
  });

  //TODO bundler calculates entries. view builds according to entries. formatter is predetermined

  // Listen for requests for application client code  
  router.on('/_serveDev/code?*', function(request, response) {
    var thisUrl = url.parse(request.url),
      params = qs.parse(thisUrl.query),
      path = utils.parseUrl(request.url);

    return ss.bundler.get(params).asset.js(path, {
      //TODO formatter: params.formatter,
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

    var start = ss.bundler.get(params).asset.start() || {};
    return utils.serve.js(start.content || '', response);
  });

  // CSS

  // Listen for requests for CSS files  
  return router.on('/_serveDev/css?*', function(request, response) {
    var params, path, thisUrl;
    thisUrl = url.parse(request.url);
    params = qs.parse(thisUrl.query);
    path = utils.parseUrl(request.url);
    return ss.bundler.get(params).asset.css(path, {
      client: params.client,
      clientId: params.ts
    }, function(output) {
      return utils.serve.css(output, response);
    });
  });
};
