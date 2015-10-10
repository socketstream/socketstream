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
    ss.http.cached.route(bundler.dests.urls.css, serveCSS);
    ss.http.cached.route(bundler.dests.urls.js, serveJS);

    router.on(bundler.dests.urls.css + '?*', serveCSS);
    router.on(bundler.dests.urls.js + '?*', serveJS);
  });

  function serveCSS(request, response) {
    var thisUrl = url.parse(request.url, true),
        clientName = thisUrl.pathname.split('/')[2],
        clientId = thisUrl.pathname.split('/')[3],
        bundler = ss.bundler.get({ name:clientName }),
        params = thisUrl.query, //qs.parse(thisUrl.query),
        content;

    if (params._) {
      return bundler.asset(bundler.entryFor('css',params._), {
          constants: bundler.constants(),
          locals: bundler.locals(),
          client: clientName,
          clientId: clientId
      }, function(output) {
          return utils.serve.css(output, response);
      });
    }

    utils.serve.css(content || '/* unknown module */', response);
  }

  function serveJS(request, response) {
    var thisUrl = url.parse(request.url, true),
        clientName = thisUrl.pathname.split('/')[2],
        clientId = thisUrl.pathname.split('/')[3],
        bundler = ss.bundler.get({ name:clientName }),
        params = thisUrl.query, //qs.parse(thisUrl.query),
        content;

    if (params.mod) {
      content = bundler.module(params.mod).map(function(mod) {
        return mod.content;
      }).join('\n');

    } else if (params._) {
      if (params._.charAt(0) === '/') {
        params._ = params._.substring(1);
      }

      // delayed serving JS
      return bundler.asset(bundler.entryFor('js',params._), {
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
    utils.serve.js(content || '// unknown module', response);
  }

  //TODO bundler - formatter is predetermined

};
