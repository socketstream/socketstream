// Template Engine
// ---------------
// By default client-side templates are concatted and sent to the client using the 'default' wrapper
// (a basic script tag with an ID generated from the file path). However you can easily specify your own template
// engine in your app.js file with the ss.client.templateEngine.use() command
// You may combine several types of template engines together - very useful when converting a site from one format
// to another, or experimenting with different template engines
'use strict';

require('colors');

var pathlib = require('path'),
    formatters = require('./formatters'),
    client = require('./system'),
    log = require('../utils/log');

// Allow Template Engine to be configured
module.exports = function(ss,options) {
  var mods = [];

  // Set the Default Engine - simply wraps each template in a <script> tag
  var defaultEngine = require('./template_engines/default').init(ss.root,null,options);

  return {

    // Use a template engine for the 'dirs' indicated (will use it on all '/' dirs within /client/templates by default)
    use: function(nameOrModule, dirs, config) {
      if (!dirs) {
        dirs = ['/'];
      }

      // Pass the name of an existing wrapper or pass your own module with a process() function
      var mod = (function() {
        if (typeof nameOrModule === 'object') {
          return nameOrModule;
        } else {
          var modPath = './template_engines/' + nameOrModule;
          if (require.resolve(modPath)) {
            return require(modPath);
          } else {
            throw new Error('The ' + nameOrModule + ' template engine is not supported by SocketStream internally. Please pass a compatible module instead');
          }
        }
      })();
      if (!(dirs instanceof Array)) {
        dirs = [dirs];
      }
      var engine;
      if (typeof mod === 'function') {
        engine = mod(ss, config, options);
      } else {
        engine = mod.init(ss, config, options);
      }
      return mods.push({
        engine: engine,
        dirs: dirs
      });
    },
    load: function() {
      var templateEngines = {};
      mods.forEach(function(mod) {
        return mod.dirs.forEach(function(dir) {
          if (dir.substring(0, 1) !== '/') {
            throw new Error('Directory name \'' + dir + '\' passed to second argument of ss.client.templateEngine.use() command must start with /');
          }
          templateEngines[dir] = mod.engine;
          return templateEngines[dir];
        });
      });
      return templateEngines;
    },

    // the default IDs for templates are best relative to client (TODO or project root?)

    // Generate output (as a string) from Template Engines
    generate: function(bundler, files, cb) {
      var prevEngine = null;
      var templates = [];
      if (!(files && files.length > 0)) {
        cb('');
      }
      return files.forEach(function(desc) {
        // Work out which template engine to use, based upon the path
        var engine = selectEngine(ss.client.templateEngines, desc.file.split('/')) || defaultEngine;

        var formatter;
        if (engine.selectFormatter) {
          formatter = engine.selectFormatter(desc.file, ss.client.formatters, null);
        }

        return bundler.format(desc, {}, formatter, function(output) {

          templates.push(wrapTemplate(output, desc.file, ss.bundler.clientFilePath(desc), engine, prevEngine));
          prevEngine = engine;

          // Return if last template
          if (templates.length === files.length) {
            output = templates.join('');
            if (engine !== null && engine.suffix) {
              output += engine.suffix();
            }
            return cb(output);
          }
        }, function(err) {

        });
      });
    }
  };
};

// prviate

function wrapTemplate(template, path, logicPath, engine, prevEngine) {
  var output;
  output = [];

  // If the template type has changed since the last template, include any closing suffix from the last engine used (if present)
  if (prevEngine && prevEngine !== engine && prevEngine.suffix) {
    output.push(prevEngine.suffix());
  }

  // If this is the first template of this type and it has prefix, include it here
  if ((prevEngine === null || prevEngine !== engine) && engine.prefix) {
    output.push(engine.prefix());
  }

  // Add main template output and return
  prevEngine = engine;
  output.push(engine.process(template.toString(), logicPath, suggestedId(path)));
  return output.join('');
}

function selectEngine(templateEngines, pathAry) {
  var codePath, engine;
  pathAry.pop(); // remove file name
  codePath = '/' + pathAry.join('/');
  engine = templateEngines[codePath];
  if (engine === void 0 && pathAry.length > 0) {
    return selectEngine(templateEngines, pathAry);
  } else {
    return engine;
  }
}

// Suggest an ID for this template based upon its path
// 3rd party Template Engine modules are free to use their own naming conventions but we recommend using this where possible
function suggestedId(path) {
  path = path.replace(/^\.\//,'');
  var sp;
  sp = path.split('.');
  if (path.indexOf('.') > 0) {
    sp.pop();
  }
  return sp.join('.').replace(/\//g, '-');
}
