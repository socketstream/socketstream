// Serve Assets in Development
// ---------------------------
// Serves all code and other assets when you DON'T call ss.client.packAssets()
'use strict';

var url     = require('url'),
    utils   = require('./utils');

// Expose asset server as the public API
//
module.exports = function (ss, router/*, options*/) {

  ss.bundler.forEach(function(bundler) {

    router.on(bundler.dests.urls.css + '?*', serveCSS);
    router.on(bundler.dests.urls.js + '?*', serveJS);
  });

  function serveCSS(request, response) {
    var thisUrl = url.parse(request.url, true),
        clientName = thisUrl.pathname.split('/')[2],
        clientId = thisUrl.pathname.split('/')[3],
        bundler = ss.bundler.get({ name:clientName }),
        params = thisUrl.query, //qs.parse(thisUrl.query),
        content = '/* unknown */';

    if (params._) {
      return bundler.asset({ext:'css', file:params._}, {
          constants: bundler.constants(),
          locals: bundler.locals(),
          client: clientName,
          clientId: clientId
      }, function(output) {
          return utils.serve.css(output, response);
      });
    }

    utils.serve.css(content, response);
  }

  function serveJS(request, response) {
    var thisUrl = url.parse(request.url, true),
        clientName = thisUrl.pathname.split('/')[2],
        clientId = thisUrl.pathname.split('/')[3],
        bundler = ss.bundler.get({ name:clientName }),
        params = thisUrl.query, //qs.parse(thisUrl.query),
        content = '// unknown';

    if (params.mod) {
        content = (bundler.module(params.mod) || {}).content;

    } else if (params._) {

        // delayed serving JS
        return bundler.asset({ext:'js', file:params._}, {
            //TODO formatter: params.formatter,
            constants: bundler.constants(),
            locals: bundler.locals(),
            client: clientName,
            clientId: clientId,
            pathPrefix: params.pathPrefix
        }, function(output) {
            return utils.serve.js(output, response);
        });
    }
    utils.serve.js(content, response);
  }

  //TODO bundler - formatter is predetermined

};
