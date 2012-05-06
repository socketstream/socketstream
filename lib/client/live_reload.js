var consoleMessage, cssExtensions, fileUtils, fs, lastRun, pathlib;

require('colors');

fs = require('fs');

pathlib = require('path');

fileUtils = require('../utils/file');

lastRun = {
  updateCSS: Date.now(),
  reload: Date.now()
};

cssExtensions = ['css', 'styl', 'stylus', 'less'];

consoleMessage = {
  updateCSS: 'CSS files changed. Updating browser...',
  reload: 'Client files changed. Reloading browser...'
};

module.exports = function(ss, options) {
  var allPaths, assetsToWatch, detectNewFiles, handleFileChange, watch;
  handleFileChange = function(action) {
    if ((Date.now() - lastRun[action]) > 1000) {
      console.log('✎'.green, consoleMessage[action].grey);
      ss.publish.all('__ss:' + action);
      return lastRun[action] = Date.now();
    }
  };
  assetsToWatch = function() {
    var output;
    output = {
      files: [],
      dirs: []
    };
    options.liveReload.forEach(function(dir) {
      var path, result;
      path = pathlib.join(ss.root, options.dirs[dir]);
      result = fileUtils.readDirSync(path);
      output.files = output.files.concat(result.files);
      return output.dirs = output.dirs.concat(result.dirs);
    });
    return output;
  };
  allPaths = assetsToWatch();
  watch = function(paths) {
    paths.dirs.forEach(function(dir) {
      return fs.watch(dir, detectNewFiles);
    });
    return paths.files.forEach(function(file) {
      var changeAction, extension, watcher;
      extension = file.split('.')[file.split('.').length - 1];
      changeAction = cssExtensions.indexOf(extension) >= 0 && 'updateCSS' || 'reload';
      return watcher = fs.watch(file, function(event) {
        handleFileChange(changeAction);
        if (event === "rename") return watcher.close();
      });
    });
  };
  detectNewFiles = function() {
    var newPaths, pathsNow;
    pathsNow = assetsToWatch();
    newPaths = {
      dirs: pathsNow.dirs.filter(function(dir) {
        return allPaths.dirs.indexOf(dir) === -1;
      }),
      files: pathsNow.files.filter(function(file) {
        return allPaths.files.indexOf(file) === -1;
      })
    };
    watch(newPaths);
    return allPaths = pathsNow;
  };
  return watch(allPaths);
};
