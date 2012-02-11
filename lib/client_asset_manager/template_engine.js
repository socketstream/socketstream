var fs, pathlib, tlib;

fs = require('fs');

pathlib = require('path');

tlib = require('./lib/template');

exports.init = function(root) {
  var defaultEngine, prevEngine, templateEngines;
  templateEngines = {};
  defaultEngine = null;
  prevEngine = null;
  defaultEngine = require('./template_engines/default').init(root);
  return {
    use: function(nameOrModule, dirs, config) {
      var engine, mod, modPath;
      if (dirs == null) dirs = ['/'];
      mod = (function() {
        if (typeof nameOrModule === 'object') {
          return nameOrModule;
        } else {
          modPath = "./template_engines/" + nameOrModule;
          if (require.resolve(modPath)) {
            return require(modPath);
          } else {
            throw new Error("The " + nameOrModule + " template engine is not supported by SocketStream internally. Please pass a compatible module instead");
          }
        }
      })();
      engine = mod.init(root, config);
      if (!(dirs instanceof Array)) dirs = [dirs];
      return dirs.forEach(function(dir) {
        if (dir.substring(0, 1) !== '/') {
          throw new Error("Directory name '" + dir + "' passed to second argument of ss.client.templateEngine.use() command must start with /");
        }
        return templateEngines[dir] = engine;
      });
    },
    generate: function(root, templateDir, files, formatters, cb) {
      var templates;
      prevEngine = null;
      templates = [];
      return files.forEach(function(path) {
        var extension, formatter, fullPath;
        extension = pathlib.extname(path);
        if (extension) extension = extension.substring(1);
        formatter = formatters[extension];
        if (formatter == null) {
          throw new Error("Unable to load client side template " + path + " because no formatter exists for ." + extension + " files");
        }
        if (formatter.assetType !== 'html') {
          throw new Error("Formatter is not for HTML files");
        }
        fullPath = pathlib.join(root, templateDir, path);
        return formatter.compile(fullPath, {}, function(output) {
          var engine;
          engine = tlib.selectEngine(templateEngines, path) || defaultEngine;
          templates.push(tlib.wrapTemplate(output, path, engine, prevEngine));
          prevEngine = engine;
          if (templates.length === files.length) {
            output = templates.join('');
            if (engine !== null && engine.suffix) output += engine.suffix();
            return cb(output);
          }
        });
      });
    }
  };
};
