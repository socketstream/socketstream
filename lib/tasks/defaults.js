'use strict';

var fs = require('fs'),
    path = require('path'),
    debug = require('debug')('socketstream'),
    socketstream = require('../socketstream'),
    log = require('../utils/log'),
    view = require('../client/view'),
    liveReload = require('./live_reload');

module.exports = function(ss, options, orchestrator) {

  return function() {
    ss.defaultTask('application', function() {});

    ss.defaultTask('start-server',['application'],function(done) {
      socketstream.ws.listen(ss.http.settings.port || 3000, done);
    });

    ss.defaultTask('load-api', function() {
      ss.load();
    });

    ss.defaultTask('test-socketstream', ['load-api'], function() {
      var sessionID = ss.session.create();

      // jshint loopfunc:true
      for (var id in ss.server.responders) {
        if (ss.server.responders.hasOwnProperty(id)) {
          var responder = ss.server.responders[id];

          if (responder.name && responder.interfaces.internal) {
            var fn = function(){
              var args = Array.prototype.slice.call(arguments),
                  cb = args.pop();

              return responder.interfaces.internal(args, {sessionId: sessionID, transport: 'test'}, function(err, params){ cb(params); });
            };
            ss.add(responder.name, fn); // interesting, potential or hack?
          }
        }
      }
    });

    // task: ondemand
    // Listen out for requests to async load new assets
    ss.defaultTask('serve', function serveOndemand(done) {
      ss.bundler.updateCachedOndemandAssets(); //TODO pipe to cache

      socketstream.ws.listen(ss.http.settings.port || 3000);

      // Send server instance to any registered modules (e.g. console)
      ss.events.emit('server:start', ss.server);

      process.on('exit', function() {
        if (done) {
          done();
        }
        ss.events.emit('server:stop', ss.server);
        orchestrator.start('stop-server',function() {
          ss.server = null;
        });
      });
    });

    ss.defaultTask('live-assets', function() {
      ss.load();
      //TODO ss.started promise to wait for. resolved when streaming server is started
      ss.bundler.forEach(function(bundler) {
        bundler.updateCachedDevAssets();
      });
    });

    ss.defaultTask('live-reload', function() {
      liveReload(ss, options);
    });

    ss.defaultTask('stop-server', function() {
      if (ss.server.httServer) {
        ss.server.httServer.close(); //TODO do it on ss.ws
        debug('stopped http server.');
      }
    });

    var defaultDeps = [];

    if (options.packedAssets) {
      defaultDeps.push(options.packedAssets.all? 'pack-all':'pack-if-needed');
    } else if (!options.servePacked) {
      defaultDeps.push('live-assets');
    }
    if (options.liveReload) {
      defaultDeps.push('live-reload');
    }
    // if (httpServer)
    defaultDeps.push('serve');

    ss.defaultTask('default',defaultDeps);

    ss.bundler.forEach(function(bundler) {
      var name = bundler.client.name;
      ss.defaultTask(name+':pack-unneeded', function() {
        log.info('✓'.green, ('Serving client \'' + name + '\' using pre-packed assets (ID ' +
            bundler.client.id + ')').grey);
      });
      ss.defaultTask(name+':pack-needed', function() {
        log.info('!'.red, ('Unable to find pre-packed assets for \'' +
            name + '\'. All assets will be repacked').grey);
      });
      ss.defaultTask(name+':pack-prepare', function(done) {
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

      ss.defaultTask(bundler.client.name+':pack-css', function(done) {
        ss.bundler.packAssetSet('css', bundler.client, bundler.toMinifiedCSS,done);
      });

      ss.defaultTask(bundler.client.name+':pack-js', function(done) {
        //TODO wait for ss.loaded promise to have socketstream-transport defined
        ss.bundler.packAssetSet('js', bundler.client, bundler.toMinifiedJS,done);
      });

      ss.defaultTask(bundler.client.name+':pack-html', function(done) {
        view(ss, bundler.client, options, function(html) {
          fs.writeFileSync(bundler.dests.paths.html, html);
          ss.log.info('✓'.green, 'Created and cached HTML file ' + bundler.dests.relPaths.html);

          //TODO perhaps put this in pack-completion target
          log.info(' ','Bundler',bundler.client.name,'packed.');
          bundler.packNeeded = false;
          done();
        });
      });
      ss.defaultTask(name+':pack', [
        name+':pack-prepare',
        name+':pack-css',
        name+':pack-js',
        name+':pack-html']);
    });

    ss.defaultTask('pack-all', this._packTasks(true));
    ss.defaultTask('pack-if-needed', this._packTasks());
    ss.defaultTask('pack-prepare', function() {
      log.info('i'.green, 'Attempting to find pre-packed assets... (force repack with SS_PACK=1)'.grey);
    });
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
