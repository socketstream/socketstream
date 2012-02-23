var fs, log, magicPath, pathlib, tag;

log = console.log;

fs = require('fs');

pathlib = require('path');

magicPath = require('./magic_path');

exports.init = function(root, codeWrappers, templateEngine) {
  var Client, containerDir, templateDir;
  containerDir = pathlib.join(root, 'client/static/assets');
  templateDir = 'client/templates';
  return Client = (function() {

    function Client(name, paths) {
      this.name = name;
      this.paths = paths;
      this.id = Number(Date.now());
      this.name = name;
    }

    Client.prototype.headers = function(packAssets) {
      var headers, ts, _ref, _ref2;
      if (packAssets == null) packAssets = false;
      ts = this.id;
      headers = [];
      if (packAssets) {
        headers.push(tag.css("/assets/" + this.name + "/" + this.id + ".css"));
        headers.push(tag.js("/assets/" + this.name + "/" + this.id + ".js"));
      } else {
        if ((_ref = this.paths.css) != null) {
          _ref.forEach(function(path) {
            return magicPath.files(root + '/client/css', path).forEach(function(file) {
              return headers.push(tag.css("/_serveDev/css/" + file + "?ts=" + ts));
            });
          });
        }
        headers.push(tag.js("/_serveDev/client?ts=" + ts));
        if ((_ref2 = this.paths.code) != null) {
          _ref2.forEach(function(path) {
            return magicPath.files(root + '/client/code', path).forEach(function(file) {
              return headers.push(tag.js("/_serveDev/code/" + file + "?ts=" + ts));
            });
          });
        }
      }
      return headers;
    };

    Client.prototype.htmlFromCache = function(ssClient, formatters, packAssets, cb) {
      var fileName;
      if (packAssets) {
        fileName = pathlib.join(containerDir, this.name, this.id + '.html');
        return fs.readFile(fileName, 'utf8', function(err, output) {
          return cb(output);
        });
      } else {
        return this.html(ssClient, formatters, false, cb);
      }
    };

    Client.prototype.html = function(ssClient, formatters, packAssets, cb) {
      var includes, outputView, paths,
        _this = this;
      includes = [];
      paths = this.paths;
      outputView = function() {
        var extension, formatter, path, sp, view;
        view = paths.view;
        sp = view.split('.');
        extension = sp[sp.length - 1];
        path = pathlib.join(root, 'client/views', view);
        formatter = formatters[extension];
        if (!formatter) {
          throw new Error("Unable to output view. Unsupported file extension " + extension + ". Please provide a suitable formatter");
        }
        if (formatter.assetType !== 'html') {
          throw new Error("Unable to render view. " + formatter.name + " is not a HTML formatter");
        }
        return formatter.compile(path, {
          headers: includes.join(''),
          filename: path
        }, cb);
      };
      if (ssClient.html != null) {
        return ssClient.html(function(codeForView) {
          var files;
          includes.push(codeForView);
          includes = includes.concat(_this.headers(packAssets));
          paths.tmpl !== false && (files = magicPath.files(pathlib.join(root, templateDir).replace(/\\/g, '/'), paths.tmpl));
          if (files && files.length > 0) {
            return templateEngine.generate(root, templateDir, files, formatters, function(templateHTML) {
              includes.push(templateHTML);
              return outputView();
            });
          } else {
            return outputView();
          }
        });
      }
    };

    Client.prototype.pack = function(ssClient, formatters, options) {
      var asset, clientDir, filesDeleted, id, numFilesDeleted, packAssetSet,
        _this = this;
      asset = require('./asset').init(root, formatters, codeWrappers);
      packAssetSet = function(assetType, paths, dir, concatinator, initialCode) {
        var filePaths, prefix, processFiles;
        if (initialCode == null) initialCode = '';
        processFiles = function(fileContents, i) {
          var path;
          if (fileContents == null) fileContents = [];
          if (i == null) i = 0;
          path = filePaths[i];
          return asset[assetType](path, {
            compress: true
          }, function(output) {
            var fileName;
            fileContents.push(output);
            if (filePaths[i + 1]) {
              return processFiles(fileContents, i + 1);
            } else {
              output = fileContents.join(concatinator);
              output = initialCode + output;
              fileName = clientDir + '/' + id + '.' + assetType;
              fs.writeFileSync(fileName, output);
              return log('✓'.green, 'Packed ' + filePaths.length + ' files into ' + fileName);
            }
          });
        };
        if (paths && paths.length > 0) {
          filePaths = [];
          prefix = pathlib.join(root, dir).replace(/\\/g, '/');
          paths.forEach(function(path) {
            return magicPath.files(prefix, path).forEach(function(file) {
              return filePaths.push(file);
            });
          });
          return processFiles();
        }
      };
      id = this.id;
      clientDir = pathlib.join(containerDir, this.name);
      log(("Pre-packing and minifying the '" + this.name + "' client...").yellow);
      if (!pathlib.existsSync(containerDir)) fs.mkdirSync(containerDir);
      if (!pathlib.existsSync(clientDir)) fs.mkdirSync(clientDir);
      if (!(options && options.keepOldFiles)) {
        numFilesDeleted = 0;
        filesDeleted = fs.readdirSync(clientDir).map(function(fileName) {
          return fs.unlinkSync(pathlib.join(clientDir, fileName));
        });
        filesDeleted.length > 1 && log('✓'.green, "" + filesDeleted.length + " previous packaged files deleted");
      }
      packAssetSet('css', this.paths.css, 'client/css', "\n");
      ssClient.code(function(output) {
        return packAssetSet('js', _this.paths.code, 'client/code', "; ", output);
      });
      return this.html(ssClient, formatters, true, function(output) {
        var fileName;
        fileName = pathlib.join(clientDir, id + '.html');
        fs.writeFileSync(fileName, output);
        return log('✓'.green, 'Created and cached HTML file ' + fileName);
      });
    };

    return Client;

  })();
};

tag = {
  css: function(path) {
    return '<link href="' + path + '" media="screen" rel="stylesheet" type="text/css">';
  },
  js: function(path) {
    return '<script src="' + path + '" type="text/javascript"></script>';
  }
};
