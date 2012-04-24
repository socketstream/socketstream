var consoleMessage, cssExtensions, fileUtils, fs, lastReload, pathlib;

require('colors');

fs = require('fs');

pathlib = require('path');

fileUtils = require('../utils/file');

lastReload = Date.now();

cssExtensions = ['css', 'styl', 'stylus', 'less'];

consoleMessage = {
  updateCSS: 'CSS files changed. Updating browser...',
  reload: 'Client files changed. Reloading browser...'
};

module.exports = function(root, options, ss) {
  var allPaths, assetsToWatch, detectNewFiles, handleFileChange, watch;
  handleFileChange = function(action) {
    if ((Date.now() - lastReload) > 1000) {
      console.log('✎'.green, consoleMessage[action].grey);
      ss.publish.all('__ss:' + action);
      return lastReload = Date.now();
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
      path = pathlib.join(root, options.dirs[dir]);
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
      return watcher = fs.watch(file, function(event, filename) {
        handleFileChange(changeAction);
        if (event === "rename") {
          watcher.close();
          return watch({
            files: [file],
            dirs: []
          });
        }
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
