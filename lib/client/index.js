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
  var packEnv = process.env['SS_PACK'];

  options.packedAssets = packEnv || false;

  options.liveReload = ['code', 'css', 'static', 'templates', 'views'];
  options.startInBundle = false;
  options.defaultEntryInit = 'require("/entry");';
  options.entryModuleName = undefined;
  options.urls = {
    assets: '/assets/'
  };
  // in 0.5 these will be relative paths
  options.dirs = {
    client: '/client',
    code: '/client/code',
    system: '/client/code/system', // will be an array after load
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
module.exports = function(ss) {
  // make bundler methods available for default and other implementations
  ss.bundler = require('./bundler/index')(ss,options);

  // extend http response API
  // Get hold of the 'response' object so we can extend it later
  var res = require('http').ServerResponse.prototype;

  // Append the 'serveClient' method to the HTTP Response object
  res.serveClient = function(name) {
    ss.http.cached.send('assets/' + name + '/' + clients[name].id + '.html',this);
  };

  // Alias res.serveClient to keep compatibility with existing apps
  res.serve = res.serveClient;

  // reloading tracking
  var lastRun = { updateCSS: {at:Date.now()}, reload: {at:Date.now()} },
      cssExtensions = ['.css', '.styl', '.stylus', '.less'],
      consoleMessage = {
        updateCSS: 'CSS files changed. Updating browser...',
        reload: 'Client files changed. Reloading browser...'
      };

  function reloadClients(changedPath,event) {
     var customOnChange = options.onChange || {},
         delayTime = customOnChange.delayTime || 100,
         guardTime = customOnChange.guardTime || 1000;

     function onChangeFiltered(path, event,action) {
         ss.log.info('✎'.green, consoleMessage[action].grey);
         var pubs ='__ss:' + action;
         if (customOnChange.publish) {
             pubs = options.onChange.publish(path, event,action,pubs);
         }
         if (pubs) {
             ss.publish.all(pubs);
         }

         lastRun[action].at = Date.now();
     }

     // reload the browser
     function onChange(changedPath, event) {
       var _ref = path.extname(changedPath),
           action = cssExtensions.indexOf(_ref) >= 0 ? 'updateCSS' : 'reload';
       //first change is with delayTime delay , thereafter only once there has been no further changes for guardTime seconds

       //validate the change
       if (customOnChange.validate) {
           if (!customOnChange.validate(changedPath, event,action)) { return ;} //ignore changes if the app says-so
       }

       //avoid multiple rapid changes
       var delay=delayTime;
       if (lastRun[action].guardTime) { clearTimeout(lastRun[action].guardTime); delay=guardTime;}
       if (lastRun[action].delayTime) { clearTimeout(lastRun[action].delayTime); delay=delayTime;}
       lastRun[action].delayTime = setTimeout(function(){
           onChangeFiltered(changedPath, event, action);
           lastRun[action].guardTime = setTimeout(function(){
               lastRun[action].guardTime=null;
               }, delay);
            lastRun[action].delayTime=null;
           }, delay);

       return Date.now();
     }

     return onChange(changedPath, event);
  }

  // Return API
  return {
    init: function() {
      this.templateEngine = this.templateEngine || require('./template_engine')(ss,options);

      if (this.formatters == null) {
        this.formatters = require('./formatters')(ss,options);

        // Load default code formatters
        this.formatters.add('javascript');
        this.formatters.add('css');
        this.formatters.add('html');
        this.formatters.add('map');
      }

      systemAssets.load();

      return this;
    },
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
      get static() {
        return path.join(ss.root,options.dirs.static);
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
    formatters: null,
    /**
     * @ngdoc service
     * @name client.templateEngine:templateEngine
     *
     * @description
     * This is for the module returned by `require('socketstream').client.templateEngine`.
     */
    templateEngine: null,
    assets: systemAssets,
    options: options,

    get faviconPath() {
      return path.join(ss.root,options.dirs.static,'favicon.ico'); //TODO find the one present
    },

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

    servePacked: function(opts) {
      if (opts && typeof opts !== 'object') {
        throw new Error('Options passed to ss.client.servePacked() must be an object');
      }
      options.servePacked = opts || true;
      options.liveReload = false;
    },

    // Tell the asset manager to pack and minimise all assets
    packAssets: function(opts) {
      if (opts && typeof opts !== 'object') {
        throw new Error('Options passed to ss.client.packAssets() must be an object');
      }
      options.packedAssets = opts || true;
      options.servePacked = opts || true;
      options.liveReload = false;

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
      var client = clients[name] = {
        name: name,
        paths: {},
        uniqueId: shortid.generate(),
        includes: {
          css: true,
          html: true,
          system: true,
          initCode: true
        }
      };
      client.id = client.uniqueId;

      ss.bundler.define(client,arguments);

      return client;
    },

    /**
     * Standard plugins or ones loaded by require. These plugins do not need to be loaded
     * in production.
     * - bundler
     * - formatter
     * - template engine
     */
    plugins: {},

    /**
     * @ngdoc service
     * @name client.task
     * @function
     * @param {string} client Name of client
     * @param {string} name Name of task
     * @param {string} dependents Array of other client tasks to execute
     * @param {function} fn Task execution
     */
    task: function(client, name, dependents, fn) {
      // should dependents be translated for other client tasks? Perhaps identify global tasks by a prefix or by lookup
      dependents = dependents.map(function(task) {
        return client+':'+task;
      });
      ss.tasks.add(client+':'+name, dependents, fn);
    },

    // experimental interface to reload cache of contents for all clients
    reloadCached: function() {
      ss.http.cached.loadStatic();
      ss.http.cached.loadAssets();
      ss.bundler.updateCachedOndemandAssets();

      ss.bundler.forEach(function(bundler) {
        bundler.updateCachedDevAssets();
      });
    },

    livereload: {
      added: function(changedPath) {
        return reloadClients(changedPath,'added');
      },
      changed: function(changedPath) {
        return reloadClients(changedPath,'changed');
      },
      removed: function(changedPath) {
        return reloadClients(changedPath,'removed');
      }
    },

    // experimental interface to reload all clients
    reloadClients : reloadClients,

    // Listen and serve incoming asset requests
    load: function() {
      if (options.servePacked) {
        ss.bundler.forEach(function(bundler) {
          bundler.useLatestsPackedId();
        });
      }
      ss.bundler.load();
      //TODO convert options.dirs to relative paths stripping the lead '/' if present

      // Cache instances of code formatters and template engines here
      // This may change in the future as I don't like hanging system objects
      // on the 'ss' internal API object, but for now it solves a problem
      // we were having when repl.start() would erase vars cached inside a module
      ss.client.formatters = this.formatters.load();
      ss.client.templateEngines = this.templateEngine.load();
    },

    unload: function() {
      ss.client.formatters = {};
      ss.client.templateEngines = {};
      ss.bundler.unload();
      systemAssets.unload();
    },

    forget: function() {
        clients = {};
        setDefaultOptions(options);
        systemAssets.unload();
        ss.bundler.forget();
        if (this.templateEngine) { this.templateEngine.forget(); this.templateEngine = null; }
        if (this.formatters) { this.formatters.forget(); this.formatters = null; }
    }
  };
};
