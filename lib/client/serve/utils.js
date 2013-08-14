'use strict';
// Client Asset Serving Shared Utils

// Private
var serve = function(body, type, response) {
    response.writeHead(200, {
        'Content-type'    : type,
        'Content-Length'  : Buffer.byteLength(body)
    });
    return response.end(body);
};

exports.serve = {
    js: function(body, response) {
        return serve(body, 'text/javascript; charset=utf-8', response);
    },
    css: function(body, response) {
        return serve(body, 'text/css', response);
    }
};

exports.parseUrl = function(url) {
    var cleanUrl = url.split('&')[0];
    return cleanUrl.split('?')[1];
};