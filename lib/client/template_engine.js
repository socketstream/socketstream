// Template Engine
// ---------------
// By default client-side templates are concatted and sent to the client using the 'default' wrapper
// (a basic script tag with an ID generated from the file path). However you can easily specify your own template
// engine in your app.js file with the ss.client.templateEngine.use() command
// You may combine several types of template engines together - very useful when converting a site from one format
// to another, or experimenting with different template engines
'use strict';

require('colors');

var path = require('path'),
    formatters = require('./formatters'),
    client = require('./system'),
    log = require('../utils/log');

// Allow Template Engine to be configured
module.exports = function(ss,options) {
  var mods = [];

  // Set the Default Engine - simply wraps each template in a <script> tag
  var defaultEngine = require('./template_engines/default')(ss.root,null,options);

  return {

    /**
     * @ngdoc function
     * @name client.templateEngine:templateEngine#use
     * @methodOf client.templateEngine:templateEngine
     * @param {string|Function} name - Built-in templating engine or function making the enging.
     * @param {Array} dirs - Directories to use template for (optional)
     * @param {Object} config - Config passed to the template engine.
     * @description
     * Use a template engine for the 'dirs' indicated (will use it on all '/' dirs within /client/templates by default)
     *
     * To make templates in `/client/ember-view` available in Ember.
     *
     *     ss.client.templateEngine.use('ember','./ember-view');
     *
     * To make templates in `/client/angular-view` available in Angular.
     *
     *     ss.client.templateEngine.use('angular','./angular-view');
     *
     * To make templates in `/client/templates/angular-view` available in Angular.
     *
     *     ss.client.templateEngine.use('angular','/angular-view');
     *
     * To make templates anywhere in `/client` available in Angular.
     *
     *     ss.client.templateEngine.use('angular','/');
     *
     * To make templates anywhere in `/client` available using a custom engine.
     *
     *     ss.client.templateEngine.use(require('custom-engine'));
     *
     * To make templates anywhere in `/client/custom` available using a custom engine.
     *
     *     ss.client.templateEngine.use(require('custom-engine'),'./custom');
     */
    use: function(nameOrModule, dirs, config) {
      if (!dirs) {
        dirs = ['.'];
      }
      if (!(dirs instanceof Array)) {
        dirs = [dirs];
      }

      var templatesPrefix = path.relative(options.dirs.client,options.dirs.templates);
      dirs = dirs.map(function(dir) {
        if (dir === '/') {
          return '.';
        }
        if (dir.charAt(0) === '/') {
          return './' + templatesPrefix + dir;
        }
        return dir;
      });

      // Pass the name of an existing wrapper or pass your own module with a process() function
      var mod = (function() {
        if (typeof nameOrModule === 'object' || typeof nameOrModule === 'function') {
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
      var engine;
      if (typeof mod === 'function') {
        engine = mod(ss, config, options);
      } else {
        engine = mod.init(ss.root, config, options);
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
          if (dir.substring(0, 1) !== '/' && dir.substring(0,2) !== './' && dir !== '.') {
            throw new Error('Directory name \'' + dir + '\' passed to second argument of ss.client.templateEngine.use() command must start with / or ./');
          }
          templateEngines[dir] = mod.engine;
          return templateEngines[dir];
        });
      });
      return templateEngines;
    },

    forget: function() {
      mods.length = 0;
    },

    // the default IDs for templates are best relative to client (TODO or project root?)

    /**
     * @ngdoc function
     * @name client.templateEngine:templateEngine#generate
     * @methodOf client.templateEngine:templateEngine
     * @param {Object} bundler - Bundler instance for client.
     * @param {Array} files - Entries for the templates to render markup for.
     * @param {Function} cb - Callback to receive the string output or Error object.
     * @description
     * Generate output (as a string) from Template Engines
     *
     *     function(out) {
     *       if (typeof out === 'string') {
     *       } else {
     *       // error object
     *       }
     *     }
     */
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

        return bundler.format(desc,
          {
            constants: bundler.constants(),
            locals: bundler.locals()
          }, formatter, function(output) {

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
          log.error(('! Errror formatting ' + (formatter||{}).name + ' template').red);
          log.error(err.message);
          return cb('');
        });
      });
    }
  };
};

// prviate

function wrapTemplate(template, pth, logicPath, engine, prevEngine) {
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
  output.push(engine.process(template.toString(), logicPath, suggestedId(pth)));
  return output.join('');
}

function selectEngine(templateEngines, pathAry) {
  pathAry.pop(); // remove file name
  var codePath = pathAry.join('/'),
      engine = templateEngines[codePath];
  if (engine) {
    return engine;
  }
  if (pathAry.length > 0) {
    return selectEngine(templateEngines, pathAry);
  }
}

// This should be on the bundler entries, so it can be tweaked by bundler before being used by the engine
// Suggest an ID for this template based upon its path
// 3rd party Template Engine modules are free to use their own naming conventions but we recommend using this where possible
function suggestedId(pth) {
  pth = pth.replace(/^\.\//,'');
  var sp;
  sp = pth.split('.');
  if (pth.indexOf('.') > 0) {
    sp.pop();
  }
  return sp.join('.').replace(/\//g, '-');
}
