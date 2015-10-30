'use strict';

var debug = require('debug')('http'),
    cached = require('./cached'),
    settings = {           // User-configurable settings with sensible defaults
      port: 3000,
      'static': {
        maxAge: 2592000000    // (30 * 24 * 60 * 60 * 1000) cache static assets in the browser for 30 days
      },
      secure: false           // allow setting of the 'secure' cookie attribute when using SSL
                              // - see https://github.com/socketstream/socketstream/issues/349
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
module.exports = function(ss) {
  return {
    /* Return API */
    get middleware() {
      if (!this._middleware) {
        // Create new Connect app instance which can be accessed from your app.js file with ss.http.middleware
        this._middleware = ss.require('connect')();
        this._middleware.use(this.session.middleware);
        this._middleware.use(this.cached.middleware);

        /* Alias app.use to indicate this will be added to the stack BEFORE SocketStream middleware */
        this._middleware.prepend = this._middleware.use;
        ss.log.warn('ss.http.middleware is deprecated, see socketstream-examples for the new way');
      }
      return this._middleware;
    },
    set middleware(mw) {
      debug('Setting SocketStream middleware');

      // express support
      if (typeof mw.disable === 'function') {
        mw.disable('x-powered-by');
      }

      this._middleware = mw;
    },
    cached: cached(ss),
    session: {
      get middleware() {
        debug('determined session middleware.');
        return ss.session.strategy.sessionMiddleware || NIL_MIDDLEWARE;
      }
    },

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

    get settings() {
      return settings;
    },

    /**
     * @ngdoc service
     * @name http.index:index#load
     * @methodOf http.index:index
     * @function
     *
     * @description
     * Attached Middleware, Session store, staticCache, etc, to the this.middleware (`var app = connect()`)
     */
    load: function() {
      this.cached.loadStatic();
      this.cached.loadAssets();
      debug('http: loaded.');
    },

    unload: function() {},

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
        this.cached.route(url, fn);
      } else {
        return {
          serveClient: (function(name) {
            this.cached.route(url,function(req, res) {
              return res.serveClient(name);
            });
          }).bind(this)
        }
      }
    }
  };

  function NIL_MIDDLEWARE(req,res,next) {
    debug('called NIL for %s',req.url);
    return next();
  }
};
