'use strict';

var log = require('../utils/log'),
    liveReload = require('./live_reload'),
    Orchestrator = require('orchestrator'),
    orchestrator = new Orchestrator();

module.exports = function(ss, options) {

  orchestrator.on('err', function(err) {
    if (typeof err === 'object') {
      err = err.err;
    }
    if (ss.env === 'production') {
      ss.log.error(err.message); //TODO production error handling strategy
    } else {
      ss.log.error('tasks failed, %s: %s', err.message, err.stack);
    }
  });

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
      var last = plan.targets[plan.targets.length-1];
      if (typeof last === 'function') {
        plan.callback = last;
        plan.targets.pop();
      }
      if (plan.targets[0] instanceof Array) {
        plan.targets = plan.targets[0];
      }
      if (plan.targets.length === 0) {
        plan.targets.push('default');
      }

      return plan;
    },

    add: task,
    defaultTask: defaultTask,

    defaults: require('./defaults')(ss, options, orchestrator),
    orchestrator:orchestrator, // this is mostly for testing

    _packTasks: function(all) {
      var tasks = all? ['load-api']:['pack-prepare','load-api'];
      ss.bundler.forEach(function(bundler){
        if (all) {
          tasks.push(bundler.client.name + ':pack');
        } else if (bundler.packNeeded) {
          tasks.push(bundler.client.name + ':pack-needed');
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
      for(var n in orchestrator.tasks) {
        delete orchestrator.tasks[n];
      }
    },

    use: function(gulp) {
      orchestrator = this.orchestrator = gulp;
      return this;
    },

    start: function(tasks, done) {
      orchestrator.start(tasks, doneIfAllDone);
      return this;

      function doneIfAllDone(err) {
        if (err) {
          log.error('!'.red, 'task failed', err);
        }

        if (!orchestrator.isRunning && done) {
          done(err);
        }
      }
    },
    on: function() {
      orchestrator.on.apply(orchestrator,arguments);
      return this;
    }
  };

  function task(name, dependents, fn) {
    orchestrator.add(name, dependents, fn);
  }

  function defaultTask(name, dependents, fn) {
    if (!orchestrator.hasTask(name)) {
      orchestrator.add(name, dependents, fn);
    }
  }

};
