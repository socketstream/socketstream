// Client Asset Manager
// --------------------
// The Client Asset Manager allows you to define multiple single-page 'clients' which can be served on
// different URLs or to different devices. Note: The Client Asset Manager deliberately makes extensive use
// of synchronous code. This is because all operations only ever run once on startup (when packing the assets)
// unless you are running in dev mode

var clients, fs, options, packAssets, path, systemAssets;

require('colors');

fs = require('fs');

path = require('path');

systemAssets = require('./system');

// Determine if assets should be (re)packed on startup
packAssets = process.env['SS_PACK'];

// Set defaults
options = {
  packedAssets: packAssets || false,
  liveReload: ['code', 'css', 'static', 'templates', 'views'],
  dirs: {
    code: '/client/code',
    css: '/client/css',
    "static": '/client/static',
    assets: '/client/static/assets',
    templates: '/client/templates',
    views: '/client/views',
    workers: '/client/workers'
  }
};

// Store each client as an object
clients = {};

module.exports = function(ss, router) {

  // Require sub modules  
  var determineLatestId, formatters, http, templateEngine;
  templateEngine = require('./template_engine')(ss);
  formatters = require('./formatters')(ss);
  http = require('./http')(ss, clients, options);

  // Load default code formatters  
  formatters.add('javascript');
  formatters.add('css');
  formatters.add('html');

  // Very basic check to see if we can find pre-packed assets
  // TODO: Improve to test for complete set  
  determineLatestId = function(client) {
    var files, id, latestId;
    try {
      files = fs.readdirSync(path.join(ss.root, options.dirs.assets, client.name));
      latestId = files.sort().pop();
      id = latestId.split('.')[0];
      if (id.length !== 13) {
        throw 'Invalid Client ID length';
      }
      return id;
    } catch (e) {
      return false;
    }
  };

  systemAssets.load();

  // Return API
  return {
    formatters: formatters,
    templateEngine: templateEngine,
    assets: systemAssets,
    options: options,

    // Merge optional options    
    set: function(newOption) {
      var k, v, x, y, _results;
      if (typeof newOption !== 'object') {
        throw new Error('ss.client.set() takes an object e.g. {liveReload: false}');
      }
      _results = [];
      for (k in newOption) {
        v = newOption[k];
        if (v instanceof Object) {
          _results.push((function() {
            var _results1;
            _results1 = [];
            for (x in v) {
              y = v[x];
              _results1.push(options[k][x] = y);
            }
            return _results1;
          })());
        } else {
          _results.push(options[k] = v);
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
          console.log('Uncaught Exception!'.red);
          return console.error(err.stack);
        });
      }
    },

    // Define a new Single Page Client    
    define: function(name, paths) {
      var _this = this;
      if (clients[name] != null) {
        throw new Error("Client name '" + name + "' has already been defined");
      }
      if (typeof paths.view !== 'string') {
        throw new Error("You may only define one HTML view per single-page client. Please pass a filename as a string, not an Array");
      }
      if (paths.view.indexOf('.') === -1) {
        throw new Error("The '" + paths.view + "' view must have a valid HTML extension (such as .html or .jade)");
      }

      // Alias 'templates' to 'tmpl'      
      if (paths.templates) {
        paths.tmpl = paths.templates;
      }

      // Force each into an array
      ['css', 'code', 'tmpl'].forEach(function(assetType) {
        if (!(paths[assetType] instanceof Array)) {
          return paths[assetType] = [paths[assetType]];
        }
      });

      // Define new client object      
      return clients[name] = {
        id: Number(Date.now()),
        name: name,
        paths: paths
      };
    },

    // Listen and serve incoming asset requests    
    load: function() {
      var client, id, name, pack;

      // Cache instances of code formatters and template engines here
      // This may change in the future as I don't like hanging system objects
      // on the 'ss' internal API object, but for now it solves a problem 
      // we were having when repl.start() would erase vars cached inside a module      
      ss.client.formatters = formatters.load();
      ss.client.templateEngines = templateEngine.load();
      
      // Code to execute once everything is loaded
      systemAssets.send('code', 'init', "require('/entry');");
      
      if (options.packedAssets) {
        
        // Attempt to find and serve existing pre-packed assets
        // If unsuccessful, assets will be re-packed automatically
        if (!packAssets) {
          ss.log('i'.green, "Attempting to find pre-packed assets... (force repack with SS_PACK=1)".grey);
          for (name in clients) {
            client = clients[name];
            if (id = options.packedAssets.id || determineLatestId(client)) {
              client.id = id;
              ss.log('✓'.green, ("Serving client '" + client.name + "' using pre-packed assets (ID " + client.id + ")").grey);
            } else {
              ss.log('!'.red, ("Unable to find pre-packed assets for '" + client.name + "'. All assets will be repacked").grey);
              packAssets = true;
            }
          }
        }

        // Pack Assets        
        if (packAssets) {
          pack = require('./pack');
          for (name in clients) {
            client = clients[name];
            pack(ss, client, options);
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
    }
  };
};
