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

  router.on('/assets/today/23423423.js?*', function(request, response) {
     utils.serve.js(url.parse(request.url).query, response);
  });

  ss.bundler.forEach(function(bundler) {

    //console.log(bundler.dests.urls.js);
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
      return bundler.asset.css(params._, {
          client: clientName,
          clientId: clientId
      }, function(output) {
          return utils.serve.css(output, response);
      });
    }

    utils.serve.js(content, response);
  }

  function serveJS(request, response) {
    var thisUrl = url.parse(request.url, true),
        clientName = thisUrl.pathname.split('/')[2],
        clientId = thisUrl.pathname.split('/')[3],
        bundler = ss.bundler.get({ name:clientName }),
        params = thisUrl.query, //qs.parse(thisUrl.query),
        content = '// unknown';

    if (params.loader) {
        var loader = bundler.asset.loader() || {},
            namesComment = '/* ' + loader.names.join(',') + ' */';
        content = namesComment + '\n' + loader.content || '';

    } else if (params.start) {
        content = (bundler.asset.start() || {}).content;

    } else if (params.mod) {
        content = (bundler.asset.systemModule(params.mod) || {}).content;

    } else if (params._) {

        // delayed serving JS
        return bundler.asset.js(params._, {
            //TODO formatter: params.formatter,
            client: clientName,
            clientId: clientId,
            pathPrefix: params.pathPrefix
        }, function(output) {
            return utils.serve.js(output, response);
        });
    }
    utils.serve.js(content, response);
  }

  //TODO bundler calculates entries. view builds according to entries. formatter is predetermined

};
