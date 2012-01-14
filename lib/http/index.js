var Router, connect, eventMiddleware, middlewareStack, pathlib, router, urllib;

urllib = require('url');

pathlib = require('path');

connect = require('../connect');

Router = require('./router').Router;

router = new Router;

exports.init = function(root) {
  return {
    router: router,
    middleware: middlewareStack(root)
  };
};

middlewareStack = function(root) {
  return connect().use(connect.cookieParser('secret')).use(connect.session({
    key: 'session_id',
    secret: 'SocketStream'
  })).use(eventMiddleware).use(connect.static(root + '/client/static'));
};

eventMiddleware = function(req, res, next) {
  var extension, url;
  url = urllib.parse(req.url);
  extension = pathlib.extname(url.pathname);
  if (extension) extension = extension.substring(1);
  if (extension && req.url.substring(0, 5) !== '/_dev') {
    return next();
  } else {
    return router.route(req.url, req, res);
  }
};
