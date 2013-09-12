// HTTP Server
// -----------
// SocketStream does not concern itself with web servers. It simply provides a stack of Connect Middleware
// which can be used by the application in any way it wishes.

var app, connect, eventMiddleware, existslib, fileUtils, fs, loadStaticDirs, pathlib, router, settings, staticDirs, staticFiles, transformURL, useAfterStack;

fs = require('fs');

pathlib = require('path');

existslib = process.version.split('.')[1] === '6' && require('path') || require('fs');

connect = require('connect');

fileUtils = require('../utils/file');

router = new (require('./router').Router);

staticDirs = [];

staticFiles = [];

// User-configurable settings with sensible defaults
settings = {
  "static": {
    maxAge: 30 * 24 * 60 * 60 * 1000 // cache static assets in the browser for 30 days
  },
  secure: false // allow setting of the 'secure' cookie attribute when using SSL - see https://github.com/socketstream/socketstream/issues/349
};

// Create new Connect app instance which can be accessed from your app.js file with ss.http.middleware
app = connect();

// Alias app.use to indicate this will be added to the stack BEFORE SocketStream middleware
app.prepend = app.use;

// Allow Connect middleware to be added AFTER SocketStream middleware has been added to the stack
useAfterStack = [];

app.append = function() {
  var args;
  args = Array.prototype.slice.call(arguments);
  return useAfterStack.push(args);
};

module.exports = function(root) {
  return {
    // Return API
    connect: connect,
    middleware: app,
    router: router,

    // Merge optional settings    
    set: function(newSettings) {
      var k, v, _results;
      if (typeof newSettings !== 'object') {
        throw new Error('ss.http.set() takes an object e.g. {static: {maxAge: 60000}}');
      }
      _results = [];
      for (k in newSettings) {
        v = newSettings[k];
        _results.push(settings[k] = v);
      }
      return _results;
    },
    load: function(staticPath, sessionStore, sessionOptions) {
      staticPath = pathlib.join(root, staticPath);
      loadStaticDirs(staticPath);

      // Append SocketStream middleware upon server load      
      app.use(connect.cookieParser('SocketStream')).use(connect.favicon(staticPath + '/favicon.ico')).use(connect.session({
        cookie: {
          path: '/',
          httpOnly: false,
          maxAge: sessionOptions.maxAge,
          secure: settings.secure
        },
        store: sessionStore
      }));

      // Append any custom-defined middleware (e.g. everyauth)      
      useAfterStack.forEach(function(m) {
        return app.use.apply(app, m);
      });

      // Finally ensure static asset serving is last      
      app.use(eventMiddleware).use(connect.compress()).use(connect["static"](staticPath, settings["static"]));
      return app;
    },

    // Expose short-form routing API    
    route: function(url, fn) {
      if (fn) {
        return router.on(url, fn);
      } else {
        return {
          serveClient: function(name) {
            var cb;
            cb = function(req, res) {
              return res.serveClient(name);
            };
            return router.on(url, cb);
          }
        };
      }
    }
  };
};

// Private

eventMiddleware = function(req, res, next) {
  var initialDir;
  initialDir = req.url.split('/')[1];

  // Rewrite incoming URLs when serving dev assets live    
  if (initialDir === '_serveDev') {
    req.url = transformURL(req.url);
  }

  // Serve a static asset if the URL starts with a static asset dir OR the router cannot find a matching route
  if (staticDirs.indexOf(initialDir) >= 0 || !router.route(req.url, req, res)) {
    return next();
  }
};

// We do this in development mode ONLY to make it easier to identify which file has an error in Chrome, etc, by
// showing the real file name instead of 'code', without breaking the event-based routing system. Improvements welcome
// e.g. this function transforms "/serveDev/code/app.js?ts=12345" to "/serveDev/code?app.js&ts=12345"
transformURL = function(url) {
  var i, x, _i;
  i = 0;
  for (x = _i = 0; _i <= 1; x = ++_i) {
    i = url.indexOf('/', i + 1);
  }
  if (url[i] === '/') {
    url = url.replace('?', '&');
    url = url.substr(0, i) + '?' + url.substr(i + 1);
  }
  return url;
};

loadStaticDirs = function(path) {
  var pathLength;
  if (existslib.existsSync(path)) {

    // Get a list of top-level static directories (used by the router)    
    staticDirs = fs.readdirSync(path);

    // Ensure /assets is always present, even if the dir has yet to be created    
    if (!(staticDirs.indexOf('assets') >= 0)) {
      staticDirs.push('assets');
    }

    // Get a list of all static files we know about (used to prevent connect.session from loading unnecessarily)    
    pathLength = path.length;
    staticFiles = fileUtils.readDirSync(path).files;
    return staticFiles = staticFiles.map(function(file) {
      return file.substr(pathLength);
    });
  }
};
