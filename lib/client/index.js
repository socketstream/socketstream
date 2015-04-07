// Client Asset Manager
// --------------------
// The Client Asset Manager allows you to define multiple single-page 'clients' which can be served on
// different URLs or to different devices. Note: The Client Asset Manager deliberately makes extensive use
// of synchronous code. This is because all operations only ever run once on startup (when packing the assets)
// unless you are running in dev mode
'use strict';

require('colors');

var shortid = require('shortid'),
    path = require('path'),
    log = require('../utils/log'),
    systemAssets = require('./system');

// Set defaults
var options = {};

function setDefaultOptions(options) {

  // Determine if assets should be (re)packed on startup
  var packAssets = process.env['SS_PACK'];

  //TODO packAssets vs packedAssets
  options.packedAssets = packAssets || false;

  options.liveReload = ['code', 'css', 'static', 'templates', 'views'];
  options.startInBundle = false;
  options.defaultEntryInit = 'require("/entry");';
  options.entryModuleName = undefined;
  options.urls = {
    assets: '/assets/'
  };
  options.dirs = {
    client: '/client',
    code: '/client/code',
    system: '/client/code/system',
    css: '/client/css',
    static: '/client/static',
    assets: '/client/static/assets',
    templates: '/client/templates',
    views: '/client/views',
    workers: '/client/workers'
  };
}

setDefaultOptions(options);

// Store each client as an object
var clients = {};

/**
 * @ngdoc service
 * @name client
 * @function
 *
 * @description
 * Client serving, bundling, development, building.
 * -----------
 * One or more clients are defined and will be served in production as a single HTML, CSS, and JS file.
 *
 * This is for the module returned by `require('socketstream').client`.
 */
module.exports = function(ss, router) {

  // make bundler methods available for default and other implementations
  ss.bundler = require('./bundler/index')(ss,options);

  // Require sub modules
  var templateEngine = require('./template_engine')(ss,options),
      formatters = require('./formatters')(ss,options);

  // extend http response API
  require('./http')(ss, clients, options);

  // Load default code formatters
  formatters.add('javascript');
  formatters.add('css');
  formatters.add('html');
  formatters.add('map');

  systemAssets.load();

  // Return API
  return {
    dirs: {
      get root() {
        return path.join(ss.root,options.dirs.client);
      },
      get code() {
        return path.join(ss.root,options.dirs.code);
      },
      get system() {
        return path.join(ss.root,options.dirs.system);
      },
      get workers() {
        return path.join(ss.root,options.dirs.workers);
      },
      get css() {
        return path.join(ss.root,options.dirs.css);
      },
      get assets() {
        return path.join(ss.root,options.dirs.assets);
      },
      get views() {
        return path.join(ss.root,options.dirs.views);
      }
    },

    /**
     * @ngdoc service
     * @name client.formatters:formatters
     *
     * @description
     * This is for the module returned by `require('socketstream').client.formatters`.
     */
    formatters: formatters,
    /**
     * @ngdoc service
     * @name client.templateEngine:templateEngine
     *
     * @description
     * This is for the module returned by `require('socketstream').client.templateEngine`.
     */
    templateEngine: templateEngine,
    assets: systemAssets,
    options: options,
    needToPackAssets: options.packedAssets,

    // Merge optional options
    set: function(newOption) {
      var k, v, y, _results;
      if (typeof newOption !== 'object') {
        throw new Error('ss.client.set() takes an object e.g. {liveReload: false}');
      }
      _results = [];
      for (k in newOption) {
        if (newOption.hasOwnProperty(k)) {
          v = newOption[k];
          if (v instanceof Object) {
            //jshint -W083
            _results.push((function() {
              var _results1, x;
              _results1 = [];
              for (x in v) {
                if (v.hasOwnProperty(x)) {
                  y = v[x];

                  if (!options[k]) {
                    options[k]= {};
                  }

                  _results1.push(options[k][x] = y);
                }
              }
              return _results1;
            })());
          } else {
            _results.push(options[k] = v);
          }
        }
      }
      return _results;
    },

    // Tell the asset manager to pack and minimise all assets
    packAssets: function(opts) {
      if (opts && typeof opts !== 'object') {
        throw new Error('Options passed to ss.client.packAssets() must be an object');
      }
      options.packedAssets = opts || true;

      // As it's safe to assume we're running in production mode at this point, if your app is not catching uncaught
      // errors with its own custom error handling code, step in and prevent any exceptions from taking the server down
      if (options.packedAssets && process.listeners('uncaughtException').length === 0) {
        return process.on('uncaughtException', function(err) {
          log.error('Uncaught Exception!'.red);
          return log.error(err.stack);
        });
      }
    },

    // Define a new Single Page Client
    /**
     * @ngdoc service
     * @name client.define
     * @function
     * @param {string} name Logical name of the client
     * @param {object} paths Paths of css, code, tmpl, view
     * @returns {{name: *} ClientDefinition} definition Client Definition
     * @description
     * Define a client view to serve.
     *
     *     ss.http.route('/my-view', function(req,res)
     *        res.serveClient('my-view');
     *     });
     */
    define: function(name) {
      if (clients[name]) {
        throw new Error('Client name \'' + name + '\' has already been defined');
      }
      // if a function is used construct a bundler with it otherwise use default bundler
      var client = clients[name] = { name: name };
      client.id = client.uniqueId = shortid.generate();
      client.paths = {};
      client.includes = {
        css: true,
        html: true,
        system: true,
        initCode: true
      };

      ss.bundler.define(client,arguments);

      return client;
    },

    // Listen and serve incoming asset requests
    load: function() {
      ss.bundler.load();

      // Cache instances of code formatters and template engines here
      // This may change in the future as I don't like hanging system objects
      // on the 'ss' internal API object, but for now it solves a problem
      // we were having when repl.start() would erase vars cached inside a module
      ss.client.formatters = formatters.load();
      ss.client.templateEngines = templateEngine.load();

      // Code to execute once everything is loaded
      systemAssets.send('code', 'init', options.defaultEntryInit);

      if (options.packedAssets) {
        var api = this;

        // Attempt to find and serve existing pre-packed assets
        // If unsuccessful, assets will be re-packed automatically
        if (!this.needToPackAssets) {
          log.info('i'.green, 'Attempting to find pre-packed assets... (force repack with SS_PACK=1)'.grey);
          ss.bundler.forEach(function(bundler) {
            var id = options.packedAssets.id || bundler.latestPackedId;
            if (id) {
              bundler.client.id = id;
              log.info('✓'.green, ('Serving client \'' + bundler.client.name + '\' using pre-packed assets (ID ' + bundler.client.id + ')').grey);
            } else {
              log.info('!'.red, ('Unable to find pre-packed assets for \'' + bundler.client.name + '\'. All assets will be repacked').grey);
              api.needToPackAssets = true;
            }
          });
        }

        // Pack Assets
        if (this.needToPackAssets) {
          for (var name in clients) {
            if (clients.hasOwnProperty(name)) {
              ss.bundler.pack(clients[name]);
            }
          }
        }
      } else {
        // Else serve files and watch for changes to files in development
        require('./serve/dev')(ss, router, options);
        if (options.liveReload) {
          require('./live_reload')(ss, options);
        }
      }
      // Listen out for requests to async load new assets
      return require('./serve/ondemand')(ss, router, options);
    },

    unload: function() {

      ss.client.formatters = {};
      ss.client.templateEngines = {};
      ss.bundler.unload();
    },

    forget: function() {
        clients = {};
        setDefaultOptions(options);
        ss.bundler.forget();
        templateEngine.forget();
        formatters.forget();
    }
  };
};
