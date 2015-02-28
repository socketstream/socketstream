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
  if (!options.onChange)  {options.onChange = {};}
  if (!options.onChange.delayTime) {options.onChange.delayTime   = 100;}
  if (!options.onChange.guardTime) {options.onChange.guardTime = 1000;}

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
      if (options.onChange.publish) {
          pubs = options.onChange.publish(path, event,action,pubs);//custom publish
      }
      if (pubs) {
          ss.publish.all(pubs);
      }    
      
      lastRun[action].at = Date.now();
      return;      
  }
  
  function onChange(path, event) {
    var action, _ref, delay;            
    //first change is with delayTime delay , thereafter only once there has been no further changes for guardTime seconds        

    action = (_ref = pathlib.extname(path), cssExtensions.indexOf(_ref) >= 0) ? 'updateCSS' : 'reload';
    
    //validate the change
    if (options.onChange.validate) {
        if (!options.onChange.validate(path, event,action)) { return ;} //ignore changes if the app says-so
    }    
    
    //avoid multiple rapid changes 
    delay=options.onChange.delayTime;
    if (lastRun[action].guardTime) { clearTimeout(lastRun[action].guardTime); delay=options.onChange.guardTime;}
    if (lastRun[action].delayTime) { clearTimeout(lastRun[action].delayTime); delay=options.onChange.delayTime;}
    lastRun[action].delayTime = setTimeout(function(){ 
        onChangeFiltered(path, event,action);
        lastRun[action].guardTime = setTimeout(function(){                       
            lastRun[action].guardTime=null;           
            }, delay);
         lastRun[action].delayTime=null;
        }, delay); 
   
    return Date.now();        
    
  }

  return onChange;
};
  
