'use strict';

// logging
var http = require('http'),
    log = require('../utils/log'),
    ondemandRoutes = require('../client/serve/ondemand'),
    devRoutes = require('../client/serve/dev'),
    liveReload = require('./live_reload');


module.exports = function(ss, router, options) {

  return {
    plan: function(args) {
      var plan = {}, httpServer = args[0];
      plan.targets = Array.prototype.slice.call(args);
      if (args.length === 0 || typeof httpServer === 'string' || httpServer instanceof Array) {
        plan.httpServer = null;
      } else {
        plan.httpServer = httpServer;
        plan.targets.shift();
      }
      if (plan.targets[0] instanceof Array) {
        plan.targets = plan.targets[0];
      }
      if (plan.targets.length === 0) {
        plan.targets.push('default');
      }

      return plan;
    },

    // the passing of http is temporary, not the best dependency
    load: function() {

      // if the app doesn't define how to start the server, this is the default
      if (!ss.orchestrator.hasTask('start-server')) {
        ss.orchestrator.add('start-server',function(done) {
          var server = http.Server(ss.http.middleware);
          server.listen(3000, function() {
            ss.stream(server); 
            console.log('server started');
            done();
          });
        });
      }

      // if the server was passed in ss.start(httpServer) one shouldn't be started
      ss.orchestrator.add('load-socketstream', (ss.server.httpServer == null)? ['start-server']:[], function() {
        console.log('loading socketstream');
        ss.load();
      });

      // task: ondemand
      // Listen out for requests to async load new assets
      ss.orchestrator.add('serve', function serveOndemand(done) {
        ondemandRoutes(ss, router, options);

        // Send server instance to any registered modules (e.g. console)
        ss.events.emit('server:start', ss.server);

        process.on('exit', function() {
          if (done) {
            done();
          }
          ss.events.emit('server:stop', ss.server);
          ss.orchestrator.start('stop-server',function() {
            ss.server = null;
          });
        });
      });

      ss.orchestrator.add('live-assets', function() {
        devRoutes(ss, router, options);
      });

      ss.orchestrator.add('live-reload', function() {
        liveReload(ss, options);
      });

      ss.orchestrator.add('stop-server', function() {
        if (ss.server.httServer) {
          ss.server.httServer.close();
        }
      });

      if (!ss.orchestrator.hasTask('default')) {
        var defaultTasks = [];

        defaultTasks.push('load-socketstream'); 
        if (options.packedAssets) {
          defaultTasks.push(options.packedAssets.all? 'pack-all':'pack-if-needed');
        } else {
          defaultTasks.push('live-assets');
        }
        if (options.liveReload) {
          defaultTasks.push('live-reload');
        }
        // if (httpServer)
        defaultTasks.push('serve');

        ss.orchestrator.add('default',defaultTasks);
      }

      this._addTasks();
    },

    unload: function() {
      liveReload.unload();
    },

    forget: function() {
      for(var n in ss.orchestrator.tasks) {
        delete ss.orchestrator.tasks[n];
      }
    },
    _addTasks: function() {
      ss.bundler.forEach(function(bundler) {

        // Pack Assets
        ss.orchestrator.add(bundler.client.name+':pack',function(done) {
          ss.bundler.pack(bundler.client, function(err) {
            if (!err) {
              console.info('Bundler',bundler.client.name,'packed.');
              bundler.packNeeded = false;
            }
            return done(err);
          }); //TODO bundler.pack();
        });
      });

      ss.orchestrator.add('pack-all', this._packTasks(true));
      ss.orchestrator.add('pack-if-needed', this._packTasks());
      ss.orchestrator.add('pack-report', function() {
        log.info('i'.green, 'Attempting to find pre-packed assets... (force repack with SS_PACK=1)'.grey);
        ss.bundler.forEach(function(bundler) {
          if (bundler.packNeeded) {
            log.info('!'.red, ('Unable to find pre-packed assets for \'' +
            bundler.client.name + '\'. All assets will be repacked').grey);
          } else {
            log.info('✓'.green, ('Serving client \'' + bundler.client.name + '\' using pre-packed assets (ID ' +
              bundler.client.servingAssetId + ')').grey);
          }
        });
      });
    },

    _packTasks: function(all) {
      var tasks = ['pack-report'];
      ss.bundler.forEach(function(bundler){
        if (all || bundler.packNeeded) {
          tasks.push(bundler.client.name + ':pack');
        }
      });
      return tasks;
    },


    start: function(tasks, done) {
      ss.orchestrator.start(tasks, doneIfAllDone);

      function doneIfAllDone(err) {
        if (err) {
          log.error('!'.red, 'task failed', err);
        }

        if (!ss.orchestrator.isRunning && done) {
          done(err);
        }
      }
    }
  };
};
