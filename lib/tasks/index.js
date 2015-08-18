'use strict';

// logging
var log = require('../utils/log'),
    liveReload = require('./live_reload');


module.exports = function(ss, options) {

  return {
    load: function() {

      // task: ondemand
      // Listen out for requests to async load new assets
      ss.orchestrator.add('serve', function serveOndemand() {
        require('./serve/ondemand')(ss, router, options);
      });

      ss.orchestrator.add('live-assets', function() {
        require('./serve/dev')(ss, router, options);
      });

      ss.orchestrator.add('live-reload', function() {
        liveReload(ss, options);
      });

      if (!ss.orchestrator.hasTask('default')) {
        var defaultTasks = [];
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
        ss.orchestrator.add(bundler.client.name+':pack',function() {
          ss.bundler.pack(bundler.client); //TODO bundler.pack();
          bundler.packNeeded = false;
        });
      });

      ss.orchestrator.add('pack-all', this._packTasks(true));
      ss.orchestrator.add('pack-if-needed', this._packTasks());
      ss.orchestrator.add('pack-report', function() {
        log.info('i'.green, 'Attempting to find pre-packed assets... (force repack with SS_PACK=1)'.grey);
        ss.bundler.forEach(function(bundler) {
          if (bundler.packNeeded) {
            log.info('!'.red, ('Unable to find pre-packed assets for \'' + bundler.client.name + '\'. All assets will be repacked').grey);
          } else {
            log.info('✓'.green, ('Serving client \'' + bundler.client.name + '\' using pre-packed assets (ID ' + bundler.client.servingAssetId + ')').grey);
          }
        });
      });
    },

    _packTasks: function(all) {
      var tasks = ['pack-report'];
      ss.bundler.forEach(function(bundler){
        if (all || bundler.packNeeded) {
          tasks.push(bundler.client.name + ":pack");
        }
      });
      return tasks;
    },


    start: function(tasks, done) {
      ss.orchestrator.start(tasks, done);

    }
  };
};
