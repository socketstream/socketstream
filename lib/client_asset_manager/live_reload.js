var fileUtils, fs, lastReload, pathlib;

require('colors');

fs = require('fs');

pathlib = require('path');

fileUtils = require('../utils/file');

lastReload = Date.now();

exports.init = function(root, ss) {
  var allPaths, assetsToWatch, detectNewFiles, handleFileChange, watch;
  handleFileChange = function(action) {
    if ((Date.now() - lastReload) > 1000) {
      switch (action) {
        case "update":
          console.log('✎'.green, 'Client files changed. Updating browser...'.grey);
          ss.publish.all('__ss:update');
          break;
        case "reload":
          console.log('✎'.green, 'Client files changed. Reloading browser...'.grey);
          ss.publish.all('__ss:reload');
      }
      return lastReload = Date.now();
    }
  };
  assetsToWatch = function() {
    var path;
    path = pathlib.join(root, 'client');
    return fileUtils.readDirSync(path);
  };
  allPaths = assetsToWatch();
  watch = function(paths) {
    paths.dirs.forEach(function(dir) {
      return fs.watch(dir, detectNewFiles);
    });
    return paths.files.forEach(function(file) {
      var extension;
      extension = file.split('.')[file.split('.').length - 1];
      if (extension === 'styl' || extension === 'css') {
        return fs.watch(file, function(event, filename) {
          return handleFileChange('update');
        });
      } else {
        return fs.watch(file, function(event, filename) {
          return handleFileChange('reload');
        });
      }
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
