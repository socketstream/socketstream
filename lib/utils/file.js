var fs = require('fs'),
    path = require('path');

// Read the contents of a dir. From https://gist.github.com/825583
exports.readDir = function(start, callback) {
  // Use lstat to resolve symlink if we are passed a symlink
  fs.lstat(start, function(err, stat) {
    if(err) {
      return callback(err);
    }
    var found = {dirs: [], files: []}, total = 0, processed = 0;
    function isDir(abspath) {
      fs.stat(abspath, function(err, stat) {
        if(stat.isDirectory()) {
          found.dirs.push(abspath);
          // If we found a directory, recurse!
          exports.readDir(abspath, function(err, data) {
              found.dirs = found.dirs.concat(data.dirs);
              found.files = found.files.concat(data.files);
              if(++processed == total) {
                  callback(null, found);
              }
          });
        } else {
          found.files.push(abspath);
          if(++processed == total) {
              callback(null, found);
          }
        }
      });
    }
    // Read through all the files in this directory
    if(stat.isDirectory()) {
      fs.readdir(start, function (err, files) {
        total = files.length;
        for(var x=0, l=files.length; x<l; x++) {
          isDir(path.join(start, files[x]));
        }
      });
    } else {
      return callback(new Error("path: " + start + " is not a directory"));
    }
  });
};

// Read the contents of a dir. Adapted from https://gist.github.com/825583
exports.readDirSync = function(start) {
  // Use lstat to resolve symlink if we are passed a symlink
  var stat = fs.lstatSync(start);
  var found = {dirs: [], files: []}, total = 0, processed = 0;
  function isDir(abspath) {
    var stat = fs.statSync(abspath);
    if(stat.isDirectory()) {
      found.dirs.push(abspath);
      // If we found a directory, recurse!
      var data = exports.readDirSync(abspath);
      found.dirs = found.dirs.concat(data.dirs);
      found.files = found.files.concat(data.files);
      if(++processed == total) return found;
    } else {
      found.files.push(abspath);
      if(++processed == total) return found;
    }
  }
  // Read through all the files in this directory
  if(stat.isDirectory()) {
    var files = fs.readdirSync(start);
    total = files.length;
    for(var x=0, l=files.length; x<l; x++) {
      isDir(path.join(start, files[x]));
    }
  } else {
    throw (new Error("path: " + start + " is not a directory"));
  }
  return found;
};


