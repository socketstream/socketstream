//TODO ss.root.lenth, ss.root
// clientDir

module.exports = function(ss, options) {

function packAssetSet(assetType, dir, client, postProcess) {
  var filePaths, prefix, 
    paths = client.paths[assetType],
    description = ss.client.describeAssets(client.name);

  function writeFile(fileContents) {
    var fileName = description.paths[assetType];
    fs.writeFileSync(fileName, postProcess(fileContents));
    return log.info('✓'.green, 'Packed ' + filePaths.length + ' files into ' + fileName.substr(ss.root.length));
  }

  function processFiles(fileContents, i) {
    var file, path, _ref;
    if (!fileContents) {
      fileContents = [];
    }
    if (!i) {
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
  }

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
}


  return {

    js: function(client, postProcess) {
      packAssetSet('js', options.dirs.code, client, postProcess);
    },

    css: function(client, postProcess) {
      packAssetSet('css', options.dirs.css, client, postProcess);
    }

  };
};

