'use strict';

var fs          = require('fs'),
    path        = require('path'),
    router      = new (require('./router').Router),
    app,
    settings    = {           // User-configurable settings with sensible defaults
      'strategy': 'default',
      'static': {
        maxAge: 2592000000    // (30 * 24 * 60 * 60 * 1000) cache static assets in the browser for 30 days
      },
      compress: true,
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
  if (settings.strategy.isStatic(req.url) || !router.route(req.url, req, res)) {
    next();
  }
}

function ensureStrategy() {
  if (typeof settings.strategy == "string") {
    settings.strategy = require('./' + settings.strategy + '.strategy');
  }
}

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
    connect   : require('connect'), // deprecated, can only be made available after strategy is initiated
    get middleware() {
      if (app == null) {
        // Create new Connect app instance which can be accessed from your app.js file with ss.http.middleware
        ensureStrategy();
        app = settings.strategy.init();

        /* Alias app.use to indicate this will be added to the stack BEFORE SocketStream middleware */
        app.prepend = app.use;

        app.append = function() {
          var args = Array.prototype.slice.call(arguments);

          return useAfterStack.push(args);
        };

      }
      return app;
    },
    set middleware(mw) {
      ensureStrategy();
      app = mw;
    },
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
    load: function(staticPath, assetsPath, sessionStore, sessionOptions) {
      if (app == null) {
        // if ss.http.middleware isn't used before server start, no need to load it
        return;
      }

      var secret = sessionOptions.secret || 'SocketStream';

      staticPath = path.join(root, staticPath);
      assetsPath = path.join(root, assetsPath);

      ensureStrategy();
      settings.strategy.load({
        root: root,
        static: staticPath,
        assets: assetsPath
      },settings);

      /* connect.compress() should be added to middleware stack on highest possible position */
      if (settings.strategy.compressMiddleware) {
        app.use(settings.strategy.compressMiddleware);
      }

      /* Append SocketStream middleware upon server load */
      if (settings.strategy.cookieParser) {
        app.use(settings.strategy.cookieParser(secret));
      }

      if (settings.strategy.favicon) {
        app.use(settings.strategy.favicon(staticPath + '/favicon.ico'))
      }
      if (settings.strategy.session) {
        app.use(settings.strategy.session({
          cookie: {
            path: '/',
            httpOnly: false,
            maxAge: sessionOptions.maxAge,
            secure: settings.secure
          },
          store: sessionStore,
          secret: secret
        }));
      }

      /* Append any custom-defined middleware (e.g. everyauth) */
      useAfterStack.forEach(function(m) {
        return app.use.apply(app, m);
      });

      /* Finally ensure static asset serving is last */
      app.use(eventMiddleware)

        // serve assets and static out of separate paths as the next step
        .use(settings.strategy.assetsMiddleware)
        .use(settings.strategy.staticMiddleware);

      /* Allow for the use of staticCache, if the option is passed */
      if (settings.strategy.cacheMiddleware) {
        app.use(settings.strategy.cacheMiddleware);
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
