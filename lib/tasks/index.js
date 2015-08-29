'use strict';

var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    log = require('../utils/log'),
    view = require('../client/view'),
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

    //TODO rename to distinguish from api.load()
    // the passing of http is temporary, not the best dependency
    load: function() {

      // if the app doesn't define how to start the server, this is the default
      if (!ss.orchestrator.hasTask('start-server')) {
        ss.orchestrator.add('start-server',function(done) {
          var server = http.Server(ss.http.middleware);
          server.listen(3000, function() {
            ss.stream(server);
            //console.log('server started');
            done();
          });
        });
      }

      // if the server was passed in ss.start(httpServer) one shouldn't be started
      ss.orchestrator.add('load-socketstream', (ss.server.httpServer == null)? ['start-server']:[], function() {
        //console.log('loading socketstream');
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

      ss.bundler.forEach(function(bundler) {
        var name = bundler.client.name;
        ss.orchestrator.add(name+':pack-unneeded', function(done) {
          log.info('✓'.green, ('Serving client \'' + name + '\' using pre-packed assets (ID ' +
              bundler.client.id + ')').grey);
        });
        ss.orchestrator.add(name+':pack-needed', function(done) {
          log.info('!'.red, ('Unable to find pre-packed assets for \'' +
              name + '\'. All assets will be repacked').grey);
          bundler.client.pack = true;
          log.info(('Pre-packing and minifying the \'' + name + '\' client...').yellow);

          // Prepare folder
          mkdir(bundler.dests.containerDir); //TODO async
          mkdir(bundler.dests.dir);
          if (!(options.packedAssets && options.packedAssets.keepOldFiles)) {
            deleteOldFiles(bundler.dests.dir);
          }
          done();

          //TODO add the tasks to an async queue that can be asserted on in tests
        });

        ss.orchestrator.add(bundler.client.name+':pack-css', function(done) {
          ss.bundler.packAssetSet('css', bundler.client, bundler.toMinifiedCSS,done);
        });

        ss.orchestrator.add(bundler.client.name+':pack-js', function(done) {
          ss.bundler.packAssetSet('js', bundler.client, bundler.toMinifiedJS,done);
        });

        ss.orchestrator.add(bundler.client.name+':pack-html', function(done) {
          view(ss, bundler.client, options, function(html) {
            fs.writeFileSync(bundler.dests.paths.html, html);
            ss.log.info('✓'.green, 'Created and cached HTML file ' + bundler.dests.relPaths.html);

            //TODO perhaps put this in pack-completion target
            console.info('Bundler',bundler.client.name,'packed.');
            bundler.packNeeded = false;
            done();
          });
        });
        ss.orchestrator.add(name+':pack', [
          name+':pack-needed',
          name+':pack-css',
          name+':pack-js',
          name+':pack-html']);
      });

      ss.orchestrator.add('pack-all', this._packTasks(true));
      ss.orchestrator.add('pack-if-needed', this._packTasks());
      ss.orchestrator.add('pack-prepare', function() {
        log.info('i'.green, 'Attempting to find pre-packed assets... (force repack with SS_PACK=1)'.grey);
        ss.load();
      });
    },

    _packTasks: function(all) {
      var tasks = ['pack-prepare'];
      ss.bundler.forEach(function(bundler){
        if (all || bundler.packNeeded) {
          tasks.push(bundler.client.name + ':pack');
        } else {
          tasks.push(bundler.client.name + ':pack-unneeded');
        }
      });
      return tasks;
    },

    unload: function() {
      liveReload.unload();
    },

    forget: function() {
      for(var n in ss.orchestrator.tasks) {
        delete ss.orchestrator.tasks[n];
      }
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

function mkdir(dir) {
  if (!fs.existsSync(dir)) {
    return fs.mkdirSync(dir);
  }
}

function deleteOldFiles(clientDir) {
  var filesDeleted = fs.readdirSync(clientDir).map(function(fileName) {
    return fs.unlinkSync(path.join(clientDir, fileName));
  });
  return filesDeleted.length > 1 && log.info('✓'.green, '' + filesDeleted.length + ' previous packaged files deleted');
}


