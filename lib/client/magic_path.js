// Magic Path
// ----------
// Allows paths to be supplied as specific files (with file extensions) or as directories
// (in which case the contents of the dir will be expanded and served in alphanumeric order)


var fileUtils;

require('colors');

fileUtils = require('../utils/file');

exports.files = function(prefix, paths) {
  var files, numRootFolders;
  if (paths == null) {
    paths = ['*'];
  }
  files = [];
  prefix = prefix.replace(/\\/g, '/'); // # replace '\' with '/' to support Windows
  numRootFolders = prefix.split('/').length;
  if (!(paths instanceof Array)) {
    paths = [paths];
  }
  paths.forEach(function(path) {
    var dir, sp, tree;
    sp = path.split('/');
    if (sp[sp.length - 1].indexOf('.') > 0) {
      return files.push(path);
    } else {
      dir = prefix;
      if (path !== '*') {
        dir += '/' + path;
      }
      if (tree = fileUtils.readDirSync(dir)) {
        return tree.files.sort().forEach(function(file) {
          return files.push(file.split('/').slice(numRootFolders).join('/'));
        });
      } else {
        return console.log(("! Error: " + dir + " directory not found").red);
      }
    }
  });
  return files;
};
