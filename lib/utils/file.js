var fs = require('fs'),
    path = require('path');

// Read the contents of a dir. Adapted from https://gist.github.com/825583
exports.readDirSync = function(start) { 
  try {
    // Use lstat to resolve symlink if we are passed a symlink
    var stat = fs.lstatSync(start);
    var found = {dirs: [], files: []}, total = 0, processed = 0;
    function isHidden(path){ return path.match(/(^_|^\.|~$)/); }
    function isDir(abspath) {
      var stat = fs.statSync(abspath);
      if(stat.isDirectory() && !isHidden(abspath.split('/').last())) {
        found.dirs.push(abspath);
        // If we found a directory, recurse!
        var data = exports.readDirSync(abspath);
        found.dirs = found.dirs.concat(data.dirs);
        found.files = found.files.concat(data.files);
        if(++processed == total) return found;
      } else {
        var file_name = abspath.split('/').last();
        if (!isHidden(file_name)) found.files.push(abspath);
        if(++processed == total) return found;
      }
    }
    // Read through all the files in this directory
    if(stat.isDirectory()) {
      var files = fs.readdirSync(start).sort();
      total = files.length;
      for(var x=0, l=files.length; x<l; x++) {
        isDir(path.join(start, files[x]));
      }
    } else {
      throw (new Error("path: " + start + " is not a directory"));
    }
    return found;
  
  } catch(e) {
    if(e.code != 'ENOENT') throw(e); // Ignore if optional dirs are missing
    return false;
  };
};


