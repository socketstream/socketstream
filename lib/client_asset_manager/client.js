var fs, log, magicPath, pathlib, tag;

log = console.log;

fs = require('fs');

pathlib = require('path');

magicPath = require('./magic_path');

exports.init = function(root, templateEngine, initAppCode) {
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
              return headers.push(tag.js("/_serveDev/code/" + file + "?ts=" + ts + "&pathPrefix=" + path));
            });
          });
        }
        headers.push(tag.js("/_serveDev/start?ts=" + ts));
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
        var extension, formatter, path, sp;
        if (typeof paths.view !== 'string') {
          throw new Error("You may only define one HTML view per single-page client. Please pass a filename as a string, not an Array");
        }
        if (paths.view.indexOf('.') === -1) {
          throw new Error("The '" + paths.view + "' view must have a valid HTML extension (such as .html or .jade)");
        }
        sp = paths.view.split('.');
        extension = sp[sp.length - 1];
        path = pathlib.join(root, 'client/views', paths.view);
        formatter = formatters[extension];
        if (!formatter) {
          throw new Error("Unable to output view '" + paths.view + "'. Unsupported file extension " + extension + ". Please provide a suitable formatter");
        }
        if (formatter.assetType !== 'html') {
          throw new Error("Unable to render view '" + paths.view + "'. " + formatter.name + " is not a HTML formatter");
        }
        return formatter.compile(path, {
          headers: includes.join(''),
          filename: path
        }, cb);
      };
      if (ssClient.html != null) {
        return ssClient.html(function(codeForView) {
          var dir, files;
          includes.push(codeForView);
          includes = includes.concat(_this.headers(packAssets));
          if (paths.templates) paths.tmpl = paths.templates;
          if (paths.tmpl) {
            dir = pathlib.join(root, templateDir);
            if (!(paths.tmpl instanceof Array)) paths.tmpl = [paths.tmpl];
            files = [];
            paths.tmpl.forEach(function(tmpl) {
              return files = files.concat(magicPath.files(dir, tmpl));
            });
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
      asset = require('./asset').init(root, formatters);
      packAssetSet = function(assetType, paths, dir, concatinator, initialCode, endCode) {
        var filePaths, prefix, processFiles;
        if (initialCode == null) initialCode = '';
        if (endCode == null) endCode = '';
        processFiles = function(fileContents, i) {
          var file, path, _ref;
          if (fileContents == null) fileContents = [];
          if (i == null) i = 0;
          _ref = filePaths[i], path = _ref.path, file = _ref.file;
          return asset[assetType](file, {
            pathPrefix: path,
            compress: true
          }, function(output) {
            var fileName;
            fileContents.push(output);
            if (filePaths[i + 1]) {
              return processFiles(fileContents, i + 1);
            } else {
              output = fileContents.join(concatinator);
              output = initialCode + output + endCode;
              fileName = clientDir + '/' + id + '.' + assetType;
              fs.writeFileSync(fileName, output);
              return log('✓'.green, 'Packed ' + filePaths.length + ' files into ' + fileName.substr(root.length));
            }
          });
        };
        if (paths && paths.length > 0) {
          filePaths = [];
          prefix = pathlib.join(root, dir);
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
      ssClient.code(function(clientCode) {
        return packAssetSet('js', _this.paths.code, 'client/code', "; ", clientCode, '; ' + initAppCode);
      });
      return this.html(ssClient, formatters, true, function(output) {
        var fileName;
        fileName = pathlib.join(clientDir, id + '.html');
        fs.writeFileSync(fileName, output);
        return log('✓'.green, 'Created and cached HTML file ' + fileName.substr(root.length));
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
