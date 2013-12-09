"use strict";

/**
 * HTTP Server
 * -----------
 * SocketStream does not concern itself with web servers. It simply provides a stack of Connect Middleware
 * which can be used by the application in any way it wishes.
 */

var fs          = require('fs'),
    pathlib     = require('path'),
    fileUtils   = require('../utils/file'),
    connect     = require('connect'),
    router      = new (require('./router').Router),
    app         = connect(),  // Create new Connect app instance which can be accessed from your app.js file with ss.http.middleware
    staticDirs  = [],
    staticFiles = [],
    settings    = {           // User-configurable settings with sensible defaults
      "static": {
        maxAge: 2592000000    // (30 * 24 * 60 * 60 * 1000) cache static assets in the browser for 30 days
      },
      secure: false           // allow setting of the 'secure' cookie attribute when using SSL - see https://github.com/socketstream/socketstream/issues/349
    },
    useAfterStack = [];       // Allow Connect middleware to be added AFTER SocketStream middleware has been added to the stack
/**
 * We do this in development mode ONLY to make it easier to identify which file has an error in Chrome, etc, by
 * showing the real file name instead of 'code', without breaking the event-based routing system. Improvements welcome
 * e.g. this function transforms
 *
 *    "/serveDev/code/app.js?ts=12345"
 *  to
 *    "/serveDev/code?app.js&ts=12345"
 *
 * @param  {String} url Url string
 * @return {String}     Transformed url
 */
function transformURL(url) {
  var i, x;
  i = 0;

  for (x = 0; x <= 1; x++) {
    i = url.indexOf('/', i + 1);
  }

  if (url[i] === '/') {
    url = url.replace('?', '&');
    url = url.substr(0, i) + '?' + url.substr(i + 1);
  }

  return url;
}

/**
 * req.url transformation middleware
 *
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
function eventMiddleware(req, res, next) {
  var initialDir = req.url.split('/')[1];

  /* Rewrite incoming URLs when serving dev assets live */
  if (initialDir === '_serveDev') {
    req.url = transformURL(req.url);
  }

  /* Serve a static asset if the URL starts with a static asset dir OR the router cannot find a matching route */
  if (staticDirs.indexOf(initialDir) >= 0 || !router.route(req.url, req, res)) {
    return next();
  }
}

/**
 * Loads static directoryes (client/static)
 *
 * @param  {String} path Path string
 * @return {Array}       Array of all static files we know about (used to prevent connect.session from loading unnecessarily)
 */
function loadStaticDirs(path) {
  var pathLength;
  if (fs.existsSync(path)) {

    /* Get a list of top-level static directories (used by the router) */
    staticDirs = fs.readdirSync(path);

    /* Ensure /assets is always present, even if the dir has yet to be created */
    if (staticDirs.indexOf('assets') === -1) {
      staticDirs.push('assets');
    }

    /* Get a list of all static files we know about (used to prevent connect.session from loading unnecessarily) */
    pathLength  = path.length;
    staticFiles = fileUtils.readDirSync(path).files;

    return staticFiles.map(function(file) {
      return file.substr(pathLength);
    });
  }
}

/* Alias app.use to indicate this will be added to the stack BEFORE SocketStream middleware */
app.prepend = app.use;

app.append = function() {
  var args = Array.prototype.slice.call(arguments);

  return useAfterStack.push(args);
};

module.exports = function(root) {
  return {
    /* Return API */
    connect   : connect,
    middleware: app,
    router    : router,

    /**
     * Merge optional settings
     * @param {Object} newSettings Object with settins, @link settings
     */
    set: function(newSettings) {
      var s = '';

      if (typeof newSettings !== 'object') {
        throw new Error('ss.http.set() takes an object e.g. {static: {maxAge: 60000}}');
      }

      for (s in newSettings) {
        if (newSettings.hasOwnProperty(s)) {
          settings[s] = newSettings[s]
        }
      }
    },

    load: function(staticPath, sessionStore, sessionOptions) {
      staticPath = pathlib.join(root, staticPath);
      loadStaticDirs(staticPath);

      /* connect.compress() should be added to middleware stack on highest possible position */
      app.use(connect.compress());

      /* Append SocketStream middleware upon server load */
      app.use(connect.cookieParser('SocketStream')).use(connect.favicon(staticPath + '/favicon.ico')).use(connect.session({
        cookie: {
          path: '/',
          httpOnly: false,
          maxAge: sessionOptions.maxAge,
          secure: settings.secure
        },
        store: sessionStore
      }));

      /* Append any custom-defined middleware (e.g. everyauth) */
      useAfterStack.forEach(function(m) {
        return app.use.apply(app, m);
      });

      /* Finally ensure static asset serving is last */
      app.use(eventMiddleware).use(connect["static"](staticPath, settings["static"]));
      return app;
    },

    /* Expose short-form routing API */
    route: function(url, fn) {
      if (fn && typeof fn === 'function') {
        return router.on(url, fn);

      } else {
        return {
          serveClient: function(name) {
            return router.on(url, function(req, res) {
              return res.serveClient(name);
            });
          }
        };
      }
    }
  };
};
