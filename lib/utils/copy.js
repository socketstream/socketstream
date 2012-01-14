var fs, path, util;

fs = require('fs');

path = require('path');

util = require('util');

exports.copyFile = function(source, destination) {
  var read, write;
  read = fs.createReadStream(source);
  write = fs.createWriteStream(destination);
  return util.pump(read, write);
};

exports.recursiveCopy = function(source, destination) {
  var files;
  files = fs.readdirSync(source);
  return files.forEach(function(file) {
    var destinationPath, sourcePath, stats;
    sourcePath = path.join(source, file);
    destinationPath = path.join(destination, file);
    stats = fs.statSync(sourcePath);
    if (stats.isDirectory()) {
      fs.mkdirSync(destinationPath, 0755);
      return exports.recursiveCopy(sourcePath, destinationPath);
    } else {
      return exports.copyFile(sourcePath, destinationPath);
    }
  });
};
