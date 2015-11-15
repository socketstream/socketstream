// Live Reload
// -----------
// Detects changes in client files and sends an event to connected browsers instructing them to refresh the page
'use strict';

require('colors');

var watcher,
    debug = require('debug')('socketstream:reload');

module.exports = function(ss, options) {

  var pathlib = require('path'),
      chokidar = ss.require('chokidar');

  var watchDirs = (function() {
    var _i, _len, _ref, _results;
    _ref = options.liveReload;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      var dir = _ref[_i];
      _results.push(pathlib.join(ss.root, options.dirs[dir] || dir));
    }
    return _results;
  })();

  watcher = chokidar.watch(watchDirs, {
    ignoreInitial: true,
    ignored: /(\/\.|~$)/
  });
  watcher.on('add', function(path) {
    debug('added: %s',path);
    return ss.livereload.added(path);
  });
  watcher.on('change', function(path) {
    debug('added: %s',path);
    return ss.livereload.changed(path);
  });
  watcher.on('unlink', function(path) {
    debug('added: %s',path);
    return ss.livereload.removed(path);
  });
  watcher.on('error', function(error) {
    return ss.log.error('✎'.red, ('Error: ' + error).red);
  });
};

module.exports.unload = function() {
  if (watcher) {
    watcher.close();
    watcher = null;
  }
};
