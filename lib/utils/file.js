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
      var abspathAry = abspath.split('/');
      if(stat.isDirectory() && !isHidden(abspathAry[abspathAry.length -1])) {
        found.dirs.push(abspath);
        // If we found a directory, recurse!
        var data = exports.readDirSync(abspath);
        found.dirs = found.dirs.concat(data.dirs);
        found.files = found.files.concat(data.files);
        if(++processed == total) return found;
      } else {
        abspathAry = abspath.split('/');
        var file_name = abspathAry[abspathAry.length-1];
        if (!isHidden(file_name)) found.files.push(abspath);
        if(++processed == total) return found;
      }
    }
    // Read through all the files in this directory
    if(stat.isDirectory()) {
      var files = fs.readdirSync(start).sort();
      total = files.length;
      for(var x=0, l=files.length; x<l; x++) {
        isDir(path.join(start, files[x]).replace(/\\/g, '/')); // replace '\' with '/' to support Windows
      }
    } else {
      throw (new Error("path: " + start + " is not a directory"));
    }
    return found;
  
  } catch(e) {
    if(e.code != 'ENOENT') throw(e); // Ignore if optional dirs are missing
    return false;
  }
};

// Load package JSON file
exports.loadPackageJSON = function () {
  try {
    return JSON.parse(fs.readFileSync(__dirname + '/../../package.json'));
  } catch (e) {
    throw('Error: Unable to find or parse SocketStream\'s package.json file');
  }
};

exports.isDir = function (filePath) { return fs.statSync(filePath).isDirectory(); };

// Given a basename, find a matching file with an extension.
// Examples:
//   findExtForBase('views/main')       => '.jade'
//   findExtForBase('css/i-dont-exist') => null
//
exports.findExtForBasePath = function (basepath) {
  var files = fs.readdirSync( path.join(basepath, '..') )
    , basename = path.basename(basepath)
    , basenameRegex = new RegExp('^' + basename)
  ;
  files = files.filter(function (file) {
    return file.match(basenameRegex) && path.extname(file);
  });
  return files.length ? path.extname(files.sort()[0]) : null;
};
