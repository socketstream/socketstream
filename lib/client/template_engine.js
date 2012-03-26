var defaultEngine, formatters, pathlib, selectEngine, suggestedId, templateEngines, wrapTemplate;

pathlib = require('path');

formatters = require('./formatters');

templateEngines = {};

defaultEngine = null;

exports.init = function(root) {
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
    }
  };
};

exports.generate = function(dir, files, cb) {
  var prevEngine, templates;
  prevEngine = null;
  templates = [];
  if (!(files && files.length > 0)) cb('');
  return files.forEach(function(path) {
    var engine, extension, f, formatter, fullPath;
    fullPath = pathlib.join(dir, path);
    engine = selectEngine(templateEngines, path.split('/')) || defaultEngine;
    extension = pathlib.extname(path);
    if (extension) extension = extension.substring(1);
    formatter = (f = formatters.byExtension[extension]) && f.assetType === 'html' && f;
    if (engine.selectFormatter) {
      formatter = engine.selectFormatter(path, formatters.byExtension, formatter);
    }
    formatter || (formatter = formatters.byExtension['html']);
    return formatter.compile(fullPath, {}, function(output) {
      templates.push(wrapTemplate(output, path, engine, prevEngine));
      prevEngine = engine;
      if (templates.length === files.length) {
        output = templates.join('');
        if (engine !== null && engine.suffix) output += engine.suffix();
        return cb(output);
      }
    });
  });
};

wrapTemplate = function(template, path, engine, prevEngine) {
  var output;
  output = [];
  if (prevEngine && prevEngine !== engine && prevEngine.suffix) {
    output.push(prevEngine.suffix());
  }
  if ((prevEngine === null || prevEngine !== engine) && engine.prefix) {
    output.push(engine.prefix());
  }
  prevEngine = engine;
  output.push(engine.process(template.toString(), path, suggestedId(path)));
  return output.join('');
};

selectEngine = function(templateEngines, pathAry) {
  var codePath, engine;
  pathAry.pop();
  codePath = '/' + pathAry.join('/');
  engine = templateEngines[codePath];
  if (engine === void 0 && pathAry.length > 0) {
    return selectEngine(templateEngines, pathAry);
  } else {
    return engine;
  }
};

suggestedId = function(path) {
  var sp;
  sp = path.split('.');
  if (path.indexOf('.') > 0) sp.pop();
  return sp.join('.').replace(/\//g, '-');
};
