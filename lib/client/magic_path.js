// Magic Path
// ----------
// Allows paths to be supplied as specific files (with file extensions) or as directories
// (in which case the contents of the dir will be expanded and served in alphanumeric order)
'use strict';

require('colors');

var fileUtils = require('../utils/file'),
    pathlib = require('path'),
    log = require('../utils/log');

exports.files = function(prefix, paths) {
  if (!paths) {
    paths = ['*'];
  }
  var files = [];
  prefix = prefix.replace(/\\/g, '/'); // # replace '\' with '/' to support Windows
  var numRootFolders = prefix.split('/').length;
  if (!(paths instanceof Array)) {
    paths = [paths];
  }
  paths.forEach(function(path) {
    var dir, sp, tree;
    sp = path.split('/');
    if (sp[sp.length - 1].indexOf('.') > 0) {
      return files.push(path); // explicit (seems like a very weak test)
    } else {
      dir = prefix;
      if (path !== '*') {
        dir = pathlib.join(dir, path);
      }
      tree = fileUtils.readDirSync(dir);
      if (tree) {
        return tree.files.sort().forEach(function(file) {
          return files.push(file.split('/').slice(numRootFolders).join('/'));
        });
      } else {
        return log.error(('! Error: ' + dir + ' directory not found').red);
      }
    }
  });
  return files;
};
