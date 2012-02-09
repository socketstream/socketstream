var app, connect, eventMiddleware, fileUtils, fs, loadStaticDirs, pathlib, router, staticDirs, staticFiles, useAfterStack;

fs = require('fs');

pathlib = require('path');

fileUtils = require('../utils/file');

connect = require('../connect');

router = new (require('./router').Router);

app = connect();

app.prepend = app.use;

useAfterStack = [];

app.append = function() {
  var args;
  args = Array.prototype.slice.call(arguments);
  return useAfterStack.push(args);
};

staticDirs = [];

staticFiles = [];

exports.init = function(root) {
  var staticPath;
  staticPath = pathlib.join(root, 'client/static');
  loadStaticDirs(staticPath);
  return {
    connect: connect,
    middleware: app,
    router: router,
    staticDirs: staticDirs,
    load: function(sessionStore, sessionOptions) {
      app.use(connect.cookieParser('SocketStream')).use(connect.session({
        cookie: {
          path: '/',
          httpOnly: false,
          maxAge: sessionOptions.maxAge
        },
        store: sessionStore
      }));
      useAfterStack.forEach(function(m) {
        return app.use.apply(app, m);
      });
      app.use(eventMiddleware).use(connect.static(staticPath));
      return app;
    }
  };
};

eventMiddleware = function(req, res, next) {
  var initialDir;
  initialDir = req.url.split('/')[1];
  if (staticDirs.indexOf(initialDir) >= 0 || !router.route(req.url, req, res)) {
    return next();
  }
};

loadStaticDirs = function(path) {
  var pathLength;
  if (pathlib.existsSync(path)) {
    staticDirs = fs.readdirSync(path);
    if (!(staticDirs.indexOf('assets') >= 0)) staticDirs.push('assets');
    pathLength = path.length;
    staticFiles = fileUtils.readDirSync(path).files;
    return staticFiles = staticFiles.map(function(file) {
      return file.substr(pathLength);
    });
  }
};
