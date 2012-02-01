var defaultEngine, fs, lastEngine, pathlib, suggestedId, templateEngines, wrapTemplate;

fs = require('fs');

pathlib = require('path');

templateEngines = {};

defaultEngine = null;

lastEngine = null;

exports.init = function(root) {
  defaultEngine = require('./template_engines/default').init(root);
  return {
    use: function(nameOrModule, dirs, config) {
      var engine;
      if (dirs == null) dirs = ['/'];
      if (typeof nameOrModule === 'string') {
        nameOrModule = require('./template_engines/' + nameOrModule);
      }
      engine = nameOrModule.init(root, config);
      if (!(dirs instanceof Array)) dirs = [dirs];
      return dirs.forEach(function(dir) {
        if (dir.substring(0, 1) !== '/') {
          throw new Error("Directory name '" + dir + "' passed to second argument of ss.client.templateEngine.use() command must start with /");
        }
        return templateEngines[dir] = engine;
      });
    },
    generate: function(root, templatePath, files, formatters, cb) {
      var templates;
      lastEngine = null;
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
        fullPath = pathlib.join(root, templatePath, path);
        return formatter.compile(fullPath, {}, function(output) {
          templates.push(wrapTemplate(output, path));
          if (templates.length === files.length) {
            output = templates.join('');
            if (lastEngine !== null && lastEngine.suffix) {
              output += lastEngine.suffix();
            }
            return cb(output);
          }
        });
      });
    }
  };
};

wrapTemplate = function(template, path) {
  var getEngine, output, pathAry;
  pathAry = path.split('/');
  output = [];
  getEngine = function(cb) {
    var codePath, engine;
    pathAry.pop();
    codePath = '/' + pathAry.join('/');
    engine = templateEngines[codePath];
    if (engine === void 0 && pathAry.length > 0) {
      return getEngine(cb);
    } else {
      return cb(engine);
    }
  };
  return getEngine(function(engine) {
    if (engine === void 0) engine = defaultEngine;
    if (lastEngine && lastEngine !== engine && lastEngine.suffix) {
      output.push(lastEngine.suffix());
    }
    if ((lastEngine === null || lastEngine !== engine) && engine.prefix) {
      output.push(engine.prefix());
    }
    lastEngine = engine;
    output.push(engine.process(template.toString(), path, suggestedId(path)));
    return output.join('');
  });
};

suggestedId = function(path) {
  var sp;
  sp = path.split('.');
  if (path.indexOf('.') > 0) sp.pop();
  return sp.join('.').replace(/\//g, '-');
};
