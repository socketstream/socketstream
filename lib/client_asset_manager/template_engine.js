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
        var engine, extension, f, formatter, fullPath;
        fullPath = pathlib.join(root, templateDir, path);
        engine = tlib.selectEngine(templateEngines, path) || defaultEngine;
        extension = pathlib.extname(path);
        if (extension) extension = extension.substring(1);
        formatter = (f = formatters[extension]) && f.assetType === 'html' && f;
        if (engine.selectFormatter) {
          formatter = engine.selectFormatter(path, formatters, formatter);
        }
        formatter || (formatter = formatters['html']);
        return formatter.compile(fullPath, {}, function(output) {
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
