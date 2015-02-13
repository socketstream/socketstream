// Live Reload
// -----------
// Detects changes in client files and sends an event to connected browsers instructing them to refresh the page
'use strict';

var chokidar, consoleMessage, cssExtensions, lastRun, pathlib, log;

require('colors');

pathlib = require('path');

chokidar = require('chokidar');

log = require('../utils/log');

lastRun = {
  updateCSS: {at:Date.now()},
  reload: {at:Date.now()}
};

cssExtensions = ['.css', '.styl', '.stylus', '.less'];

consoleMessage = {
  updateCSS: 'CSS files changed. Updating browser...',
  reload: 'Client files changed. Reloading browser...'
};

module.exports = function(ss, options) {
  var dir, watchDirs, watcher;
  
  //set default timings
  if (!options.onChange)  options.onChange = {};
  if (!options.onChange.DelayTime) options.onChange.DelayTime   = 100;
  if (!options.onChange.GuardTime) options.onChange.GuardTime = 1000;
   
  watchDirs = (function() {
    var _i, _len, _ref, _results;
    _ref = options.liveReload;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      dir = _ref[_i];
      _results.push(pathlib.join(ss.root, options.dirs[dir]));
    }
    return _results;
  })();
  watcher = chokidar.watch(watchDirs, {
    ignored: /(\/\.|~$)/
  });
  watcher.on('add', function(path) {
    return onChange(path, 'added');
  });
  watcher.on('change', function(path) {
    return onChange(path, 'changed');
  });
  watcher.on('unlink', function(path) {
    return onChange(path, 'removed');
  });
  watcher.on('error', function(error) {
    return log.error('✎'.red, ('Error: ' + error).red);
  });

  function onChangeFiltered(path, event,action) {
      log.info('✎'.green, consoleMessage[action].grey);
      var pubs ='__ss:' + action;
      if (options.onChange.Publish) 
          pubs = options.onChange.Publish(path, event,action,pubs);//custom publish
      
      if (pubs) ss.publish.all(pubs);
      
      lastRun[action].at = Date.now();
      return;      
  }

  function onChange(path, event) {
    var action, _ref;
    //first change is with DelayTime delay , thereafter only once there has been no further changes for GuardTime seconds        
    
    action = (_ref = pathlib.extname(path), cssExtensions.indexOf(_ref) >= 0) ? 'updateCSS' : 'reload';
    
    //validate the change
    if (options.onChange.Validate) 
        if (!options.onChange.Validate(path, event,action)) return ; //ignore changes if the app says-so
    
    //avoid multiple rapid changes 
    var delay=options.onChange.DelayTime;
    if (lastRun[action].GuardTime) { clearTimeout(lastRun[action].GuardTime); delay=options.onChange.GuardTime;}
    if (lastRun[action].DelayTime) { clearTimeout(lastRun[action].DelayTime); delay=options.onChange.GuardTime;}
    lastRun[action].DelayTime = setTimeout(function(){ 
        onChangeFiltered(path, event,action);
        lastRun[action].GuardTime = setTimeout(function(){                       
            lastRun[action].GuardTime=null;           
            }, delay);
         lastRun[action].DelayTime=null;
        }, delay); 
   
    return Date.now()        
  }

  return onChange;
};
  
