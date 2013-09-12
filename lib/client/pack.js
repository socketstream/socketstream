// Asset Packer
// ------------
// Packs all CSS, JS and HTML assets declared in the ss.client.define() call to be sent upon initial connection
// Other code modules can still be served asynchronously later on

var cleanCSS, deleteOldFiles, existslib, formatKb, fs, log, magicPath, mkdir, pathlib, system, view;

log = console.log;

require('colors');

fs = require('fs');

pathlib = require('path');

existslib = process.version.split('.')[1] === '6' && require('path') || require('fs');

cleanCSS = require('clean-css');

system = require('./system');

magicPath = require('./magic_path');

view = require('./view');

module.exports = function(ss, client, options) {
  var asset, clientDir, containerDir, packAssetSet;
  asset = require('./asset')(ss, options);
  client.pack = true;
  containerDir = pathlib.join(ss.root, options.dirs.assets);
  clientDir = pathlib.join(containerDir, client.name);
  packAssetSet = function(assetType, paths, dir, postProcess) {
    var filePaths, prefix, processFiles, writeFile;
    writeFile = function(fileContents) {
      var fileName;
      fileName = clientDir + '/' + client.id + '.' + assetType;
      fs.writeFileSync(fileName, postProcess(fileContents));
      return log('✓'.green, 'Packed ' + filePaths.length + ' files into ' + fileName.substr(ss.root.length));
    };
    processFiles = function(fileContents, i) {
      var file, path, _ref;
      if (fileContents == null) {
        fileContents = [];
      }
      if (i == null) {
        i = 0;
      }
      _ref = filePaths[i], path = _ref.path, file = _ref.file;
      return asset[assetType](file, {
        pathPrefix: path,
        compress: true
      }, function(output) {
        fileContents.push(output);
        if (filePaths[++i]) {
          return processFiles(fileContents, i);
        } else {
          return writeFile(fileContents);
        }
      });
    };

    // Expand any dirs into real files    
    if (paths && paths.length > 0) {
      filePaths = [];
      prefix = pathlib.join(ss.root, dir);
      paths.forEach(function(path) {
        return magicPath.files(prefix, path).forEach(function(file) {
          return filePaths.push({
            path: path,
            file: file
          });
        });
      });
      return processFiles();
    }
  };

  /* PACKER */

  log(("Pre-packing and minifying the '" + client.name + "' client...").yellow);
  
  // Prepare folder
  mkdir(containerDir);
  mkdir(clientDir);
  if (!(options.packedAssets && options.packedAssets.keepOldFiles)) {
    deleteOldFiles(clientDir);
  }

  // Output CSS  
  packAssetSet('css', client.paths.css, options.dirs.css, function(files) {
    var minified, original;
    original = files.join("\n");
    minified = cleanCSS.process(original);
    log(("  Minified CSS from " + (formatKb(original.length)) + " to " + (formatKb(minified.length))).grey);
    return minified;
  });

  // Output JS  
  packAssetSet('js', client.paths.code, options.dirs.code, function(files) {
    return system.serve.js({
      compress: true
    }) + files.join(';') + ';' + system.serve.initCode();
  });

  // Output HTML view  
  return view(ss, client, options, function(html) {
    var fileName;
    fileName = pathlib.join(clientDir, client.id + '.html');
    fs.writeFileSync(fileName, html);
    return log('✓'.green, 'Created and cached HTML file ' + fileName.substr(ss.root.length));
  });
};

// PRIVATE

formatKb = function(size) {
  return "" + (Math.round((size / 1024) * 1000) / 1000) + " KB";
};

mkdir = function(dir) {
  if (!existslib.existsSync(dir)) {
    return fs.mkdirSync(dir);
  }
};

deleteOldFiles = function(clientDir) {
  var filesDeleted, numFilesDeleted;
  numFilesDeleted = 0;
  filesDeleted = fs.readdirSync(clientDir).map(function(fileName) {
    return fs.unlinkSync(pathlib.join(clientDir, fileName));
  });
  return filesDeleted.length > 1 && log('✓'.green, "" + filesDeleted.length + " previous packaged files deleted");
};
