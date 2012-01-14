var parseUrl, serve, url;

require('colors');

url = require('url');

exports.init = function(router, ssClient, asset) {
  router.on('/_dev/client?*', function(request, response) {
    return ssClient.code(function(output) {
      return serve(output, 'text/javascript; charset=utf-8', response);
    });
  });
  router.on('/_dev/code?*', function(request, response) {
    var path;
    path = parseUrl(request.url);
    return asset.js(path, {
      compess: false
    }, function(output) {
      return serve(output, 'text/javascript; charset=utf-8', response);
    });
  });
  return router.on('/_dev/css?*', function(request, response) {
    var path;
    path = parseUrl(request.url);
    return asset.css(path, {
      compess: false
    }, function(output) {
      return serve(output, 'text/css', response);
    });
  });
};

serve = function(body, type, response) {
  response.writeHead(200, {
    'Content-type': type,
    'Content-Length': Buffer.byteLength(body)
  });
  return response.end(body);
};

parseUrl = function(url) {
  var cleanUrl;
  cleanUrl = url.split('&')[0];
  return cleanUrl.split('?')[1];
};
