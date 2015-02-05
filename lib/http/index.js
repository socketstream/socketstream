// http index.js
// todo: better summation comment on what this module does
'use strict';
var connectStaticCache = require('connect-static');
var connectStatic = require('serve-static');
var favicon = require('serve-favicon');
var seshin = require('express-session');
var compress = require('compression');
var cookieParser = require('cookie-parser');
var fs          = require('fs'),
    pathlib     = require('path'),
    fileUtils   = require('../utils/file'),
    connect     = require('connect'),
    router      = new (require('./router').Router),
    app         = connect(),  // Create new Connect app instance which can be accessed from your app.js file with ss.http.middleware
    staticDirs  = [],
    staticFiles = [],
    settings    = {           // User-configurable settings with sensible defaults
      'static': {
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
 * @param  {[type]}   req  Request object
 * @param  {[type]}   res  Responce object
 * @param  {Function} next Success callback function
 * @return {Void}
 */
function eventMiddleware(req, res, next) {
  var initialDir = req.url.split('/')[1];

  /* Rewrite incoming URLs when serving dev assets live */
  if (initialDir === '_serveDev') {
    req.url = transformURL(req.url);
  }

  /* Serve a static asset if the URL starts with a static asset dir OR the router cannot find a matching route */
  if (staticDirs.indexOf(initialDir) >= 0 || !router.route(req.url, req, res)) {
    next();
  }
}

/**
 * Loads static directories (client/static)
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

/**
 * @ngdoc service
 * @name http.index:index
 * @function
 *
 * @description
 * HTTP Server
 * -----------
 * SocketStream does not concern itself with web servers. It simply provides a stack of Connect Middleware
 * which can be used by the application in any way it wishes.
 */
module.exports = function(root) {
  return {
    /* Return API */
    connect   : connect,
    middleware: app,
    router    : router,

    /**
     * @ngdoc service
     * @name http.index:index#set
     * @methodOf http.index:index
     * @function
     *
     * @description
     * Merge optional settings
     *
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

    /**
     * @ngdoc service
     * @name http.index:index#load
     * @methodOf http.index:index
     * @function
     *
     * @description
     * Attached Middleware, Session store, staticCache, etc, to the this.middleware (`var app = connect()`)
     *
     * @param  {String} staticPath     Static path for connect for serving static assets as `*.js`, `*.css`, etc.
     * @param  {Object} sessionStore   Session store instance object
     * @param  {Object} sessionOptions Session store options
     * @return {Object}                Updated, with attached Middleware, this.middleware(`var app = connect()`) instance
     */
    load: function(staticPath, sessionStore, sessionOptions) {
      var secret = sessionOptions.secret || 'SocketStream';

      staticPath = pathlib.join(root, staticPath);
      loadStaticDirs(staticPath);

      /* connect.compress() should be added to middleware stack on highest possible position */
      app.use(compress());

      /* Append SocketStream middleware upon server load */
      // same as above, will be using a different dependency when new Connect comes into effect
      app.use(cookieParser(secret));

      app.use(favicon(staticPath + '/favicon.ico')).use(seshin({
        cookie: {
          path: '/',
          httpOnly: false,
          maxAge: sessionOptions.maxAge,
          secure: settings.secure
        },
        store: sessionStore,
        secret: secret
      }));

      /* Append any custom-defined middleware (e.g. everyauth) */
      useAfterStack.forEach(function(m) {
        return app.use.apply(app, m);
      });

      /* Finally ensure static asset serving is last */
      app.use(eventMiddleware).use(connectStatic(staticPath, settings['static']));
      //app.use(eventMiddleware).use(connect['static'](staticPath, settings['static']));

      /* Allow for the use of staticCache, if the option is passed */
      if (settings.staticCache) {
        app.use(connectStaticCache(settings['staticCache']));
      }

      return app;
    },

    /**
     * @ngdoc service
     * @name http.index:index#route
     * @methodOf http.index:index
     * @function
     *
     * @description
     * Expose short-form routing API
     *
     * @param  {String}   url Url string for routing
     * @param  {Function} fn  Callback function for url
     * @return {Object}       res.serveClient(name) object
     */
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
        }
      }
    }
  }
}
