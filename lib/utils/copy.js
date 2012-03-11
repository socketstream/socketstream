var copyFile, fs, path, util,
  __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

fs = require('fs');

path = require('path');

util = require('util');

exports.recursiveCopy = function(source, destination, options) {
  var copyDir, originalSourceLength;
  if (options == null) options = {};
  originalSourceLength = source.length;
  copyDir = function(source, destination, options) {
    var files;
    files = fs.readdirSync(source);
    return files.forEach(function(file) {
      var destinationPath, extension, sourcePath, stats, thisPath;
      sourcePath = path.join(source, file);
      destinationPath = path.join(destination, file);
      stats = fs.statSync(sourcePath);
      if (stats.isDirectory()) {
        fs.mkdirSync(destinationPath, 0755);
        return copyDir(sourcePath, destinationPath, options);
      } else {
        thisPath = path.dirname(sourcePath).substr(originalSourceLength) || '/';
        extension = path.extname(sourcePath);
        if (!options.exclude || (__indexOf.call(options.exclude.inPaths, thisPath) < 0) || (__indexOf.call(options.exclude.extensions, extension) < 0)) {
          return copyFile(sourcePath, destinationPath);
        }
      }
    });
  };
  return copyDir(source, destination, options);
};

copyFile = function(source, destination) {
  var read, write;
  read = fs.createReadStream(source);
  write = fs.createWriteStream(destination);
  return util.pump(read, write);
};
