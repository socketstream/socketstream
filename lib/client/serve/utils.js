'use strict';



// Client Asset Serving Shared Utils
var serve;

exports.serve = {
  js: function (body, response) {
    return serve(body, 'text/javascript; charset=utf-8', response);
  },
  css: function (body, response) {
    return serve(body, 'text/css', response);
  }
};

// TODO - consider replacing with Node public API - PJENSEN
//
exports.parseUrl = function (url) {
  var cleanUrl;
  cleanUrl = url.split('&')[0];
  return cleanUrl.split('?')[1];
};

// Private

serve = function (body, type, response) {
  response.writeHead(200, {
    'Content-type': type,
    'Content-Length': Buffer.byteLength(body)
  });
  return response.end(body);
};