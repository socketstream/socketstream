// Template Engine
// ---------------
// By default client-side templates are concatted and sent to the client using the 'default' wrapper
// (a basic script tag with an ID generated from the file path). However you can easily specify your own template
// engine in your app.js file with the ss.client.templateEngine.use() command
// You may combine several types of template engines together - very useful when converting a site from one format
// to another, or experimenting with different template engines

var client, formatters, pathlib, selectEngine, suggestedId, wrapTemplate;

require('colors');

pathlib = require('path');

formatters = require('./formatters');

client = require('./system');

// Allow Template Engine to be configured
module.exports = function(ss) {
  var defaultEngine, mods;
  mods = [];

  // Set the Default Engine - simply wraps each template in a <script> tag  
  defaultEngine = require('./template_engines/default').init(ss.root);
  return {

    // Use a template engine for the 'dirs' indicated (will use it on all '/' dirs within /client/templates by default)    
    use: function(nameOrModule, dirs, config) {
      var engine, mod, modPath;
      if (dirs == null) {
        dirs = ['/'];
      }

      // Pass the name of an existing wrapper or pass your own module with a process() function      
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
      if (!(dirs instanceof Array)) {
        dirs = [dirs];
      }
      engine = mod.init(ss, config);
      return mods.push({
        engine: engine,
        dirs: dirs
      });
    },
    load: function() {
      var templateEngines;
      templateEngines = {};
      mods.forEach(function(mod) {
        return mod.dirs.forEach(function(dir) {
          if (dir.substring(0, 1) !== '/') {
            throw new Error("Directory name '" + dir + "' passed to second argument of ss.client.templateEngine.use() command must start with /");
          }
          return templateEngines[dir] = mod.engine;
        });
      });
      return templateEngines;
    },

    // Generate output (as a string) from Template Engines    
    generate: function(dir, files, cb) {
      var prevEngine, templates;
      prevEngine = null;
      templates = [];
      if (!(files && files.length > 0)) {
        cb('');
      }
      return files.forEach(function(path) {
        var engine, extension, f, formatter, fullPath;
        fullPath = pathlib.join(dir, path);

        // Work out which template engine to use, based upon the path        
        engine = selectEngine(ss.client.templateEngines, path.split('/')) || defaultEngine;

        // Try and guess the correct formatter to use BEFORE the content is sent to the template engine        
        extension = pathlib.extname(path);
        if (extension) {
          extension = extension.substring(1);
        }

        // Optionally allow engine to select a different formatter
        // This is useful for edge cases where .jade files should be compiled by the engine, not the formatter
        formatter = (f = ss.client.formatters[extension]) && f.assetType === 'html' && f;
        if (engine.selectFormatter) {
          formatter = engine.selectFormatter(path, ss.client.formatters, formatter);
        }

        // If we still don't have a formatter by this point, default to 'HTML' (echo/bypass)        
        formatter || (formatter = ss.client.formatters['html']);

        // Use the formatter to pre-process the template before passing it to the engine
        try {
          return formatter.compile(fullPath, {}, function(output) {
            templates.push(wrapTemplate(output, path, fullPath, engine, prevEngine));
            prevEngine = engine;

            // Return if last template            
            if (templates.length === files.length) {
              output = templates.join('');
              if (engine !== null && engine.suffix) {
                output += engine.suffix();
              }
              return cb(output);
            }
          });
        } catch (e) {
          console.log(("! Errror formatting " + formatter.name + " template").red);
          console.error(e.message);
          return cb('');
        }
      });
    }
  };
};

// prviate

wrapTemplate = function(template, path, fullPath, engine, prevEngine) {
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
  output.push(engine.process(template.toString(), fullPath, suggestedId(path)));
  return output.join('');
};

selectEngine = function(templateEngines, pathAry) {
  var codePath, engine;
  pathAry.pop(); // remove file name
  codePath = '/' + pathAry.join('/');
  engine = templateEngines[codePath];
  if (engine === void 0 && pathAry.length > 0) {
    return selectEngine(templateEngines, pathAry);
  } else {
    return engine;
  }
};

// Suggest an ID for this template based upon its path
// 3rd party Template Engine modules are free to use their own naming conventions but we recommend using this where possible
suggestedId = function(path) {
  var sp;
  sp = path.split('.');
  if (path.indexOf('.') > 0) {
    sp.pop();
  }
  return sp.join('.').replace(/\//g, '-');
};
