var Router, connect, eventMiddleware, fs, loadStaticDirs, middlewareStack, pathlib, router, staticDirs;

fs = require('fs');

pathlib = require('path');

connect = require('../connect');

Router = require('./router').Router;

router = new Router;

staticDirs = [];

exports.init = function(root) {
  return {
    router: router,
    staticDirs: loadStaticDirs(),
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
  var initialDir;
  initialDir = req.url.split('/')[1];
  if (staticDirs.indexOf(initialDir) >= 0) {
    return next();
  } else {
    return router.route(req.url, req, res);
  }
};

loadStaticDirs = function() {
  var path;
  path = pathlib.join(root, 'client/static');
  if (pathlib.existsSync(path)) return staticDirs = fs.readdirSync(path);
};
