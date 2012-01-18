var magicPath, parseUrl, pathlib, serve, url;

require('colors');

url = require('url');

pathlib = require('path');

magicPath = require('./magic_path');

exports.init = function(router, ssClient, asset, packAssets) {
  router.on('/_serveAsync/code?*', function(request, response) {
    var dir, files, output, path;
    path = parseUrl(request.url);
    dir = pathlib.join(root, 'client/code');
    files = magicPath.files(dir, [path]);
    output = [];
    return files.forEach(function(path) {
      return asset.js(path, {
        compress: packAssets
      }, function(js) {
        output.push(js);
        if (output.length === files.length) {
          return serve(output.join("\n"), 'text/javascript; charset=utf-8', response);
        }
      });
    });
  });
  if (!packAssets) {
    router.on('/_serveDev/client?*', function(request, response) {
      return ssClient.code(function(output) {
        return serve(output, 'text/javascript; charset=utf-8', response);
      });
    });
    router.on('/_serveDev/code?*', function(request, response) {
      var path;
      path = parseUrl(request.url);
      return asset.js(path, {
        compress: false
      }, function(output) {
        return serve(output, 'text/javascript; charset=utf-8', response);
      });
    });
    return router.on('/_serveDev/css?*', function(request, response) {
      var path;
      path = parseUrl(request.url);
      return asset.css(path, {
        compress: false
      }, function(output) {
        return serve(output, 'text/css', response);
      });
    });
  }
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
