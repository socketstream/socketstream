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
    client = require('./system');

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

      dirs = dirs.map(function(dir) {
        if (dir === '/') {
          return '.';
        }
        if (dir.charAt(0) === '/') {
          return path.join(options.dirs.templates.substring(1), dir.substring(1));
        }
        return path.join(options.dirs.client.substring(1), dir);
      });

      var mod = ss.require(nameOrModule, 'client/template_engines', function(err) {
        throw new Error('The ' + err.id + ' template engine is not supported by SocketStream internally '+
          'or found in the project packages. Please pass a compatible module instead');
      });
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
          templateEngines[dir] = mod.engine;
          return templateEngines[dir];
        });
      });
      return templateEngines;
    },

    forget: function() {
      mods.length = 0;
    },

    //TODO the default IDs for templates are best relative to client (or project root?)

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
        // Work out which template engine to use, based upon the path (TODO split file.sep)
        var engine = selectEngine(desc.file) || defaultEngine;

        var formatter;
        if (engine.selectFormatter) {
          formatter = engine.selectFormatter(desc.file, ss.client.formatters, null);
        }

        var opts = {
          constants: bundler.constants(),
          locals: bundler.locals()
        };

        return bundler.format(desc,
          opts, formatter, function(output) {

          templates.push(wrapTemplate(output, desc.file, ss.bundler.clientFilePath(desc), opts, options, engine, prevEngine));
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
          ss.log.clientIssue(client,options,err,desc);
          return cb('Couldn\'t format ' + desc.file + err.userInfoHTML);
        });
      });
    }
  };

  // private

  function selectEngine(p) {
    var codePath = path.dirname(p); // remove the file name or child directory in recursive call
    var engine = ss.client.templateEngines[codePath];

    if (engine) {
      return engine;
    }
    if (codePath !== '.') {
      return selectEngine(codePath || '.');
    }
  }

  function wrapTemplate(template, pth, logicPath, opts, options, engine, prevEngine) {
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
    output.push(engine.process(template.toString(), logicPath, suggestedId(pth, options.dirs.templates.substring(1)), opts));
    return output.join('');
  }

  // This should be on the bundler entries, so it can be tweaked by bundler before being used by the engine
  // Suggest an ID for this template based upon its path
  // 3rd party Template Engine modules are free to use their own naming conventions but we recommend using this where possible
  function suggestedId(pth, templatesPath) {
    if (pth.indexOf(templatesPath) === 0) {
      pth = pth.substring(templatesPath.length + 1);
    }
    var sp;
    sp = pth.split('.');
    if (pth.indexOf('.') > 0) {
      sp.pop();
    }
    return sp.join('.').replace(/\//g, '-');
  }
};

