// Client-Side Bundler of assets in development and production
'use strict';

var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    log = require('../../utils/log'),
    CleanCSS = require('clean-css'),
    system = require('../system'),
    glob = require('glob'),
    uglifyjs = require('uglify-js');

/**
 * {const|local|start|lib|mod} AssetType
 *
 * {'css'|'html'|'worker'|'js'} AssetBundleType
 * @typedef {
 *  name:string,
 *  path:string,
 *  dir:string,
 *  content:string,
 *  options:string,
 *  type:string
 *  } AssetEntry
 */

/**
 * Bundler by client name
 * @type {{}}
 */
var bundlers = {},
    bundlerById = {};

function getBundler(client){
  if (typeof client === "string") { return bundlers[client]; }

  if (client.bundler) { return client.bundler; }

  if (client.ts) {
    if (bundlerById[client.ts]) {
      return bundlerById[client.ts];
    }
  }
  if (typeof client.client === "string") {
    return bundlers[client.client];
  }
  if (typeof client.name === "string") {
    return bundlers[client.name];
  }

  throw new Error('Unknown client '+(client.name || client.client || client.ts) );
}

/**
 * @ngdoc service
 * @name bundler
 * @function
 * @description
 * Bundlers included.
 */

/**
 * @ngdoc service
 * @name ss.bundler:bundler
 * @function
 *
 * @description
 * Client bundling API
 * -----------
 * Client bundling API for implementing a custom bundler.
 */
module.exports = function(ss,options) {

  var proto = require('./proto')(ss, bundlers, bundlerById, options),
      compressor = uglifyjs.Compressor({warnings:false});

  function systemModule(name,wrap) {
    name = name.replace(/\.js$/,'');
    var mod = system.assets.modules[name];
    if (mod) {
      var code = wrap===false? mod.content: ss.bundler.wrapModule(name, mod.content);
      return {
        file: mod.name,
        name: mod.name,
        path: mod.path,
        dir: mod.dir,
        content: code,
        options: mod.options,
        type: mod.type,
        includeType: 'system'
      };
    }
  }

  return {

    create: function create(bundler) {
      var created = Object.create(proto);
      if (bundler) {
        for(var key in bundler) {
          created[key] = bundler[key];
        }
      }
      return created;
    },

    /**
     * @ngdoc method
     * @name ss.bundler:bundler#define
     * @methodOf ss.bundler:bundler
     * @function
     * [Internal] Define the bundler for a client (do not call directly)
     * @param {string} client object to store the definition in
     * @param {object} args arguments passed to define
     */
    define: function defineBundler(client,args) {

      var name = args[0],
          pathsOrPlugin = args[1],
          bundler;

      if (typeof pathsOrPlugin === "string") {
        bundler = bundlers[name] = ss.require(options.servePacked?'production':args[1],'client/bundler','default')(ss,client,options);
        bundler.client = client;
        bundler.define(args[2], args[3], args[4], args[5]);
      } else {
        bundler = bundlers[name] = require('./default')(ss,client,options); //TODO production bundler switch
        bundler.client = client;
        bundler.define(args[1],args[2]);
      }
      bundler.useLatestsPackedId();
    },

    /**
     * @ngdoc method
     * @name ss.bundler:bundler#get
     * @methodOf ss.bundler:bundler
     * @function
     * @description
     * Determine the bundler for a client
     * @param {object|string} client Query params with client=name or an actual client object
     */
    get: getBundler,

    forEach: function(fn,that) {
      for(var key in bundlers) {
          var bundler = bundlers[key];
          fn.call(that,bundler,key);
      }
    },

    findEntryPoint: function(client) {

      var firstIndex, // if no entry point, use first index found
          firstFile;  // if no entry and index, use first file found

      function onlyModuleEntry(f) {
        return f.substring(0,6) === 'entry.';
      }
      function onlyModuleIndex(f) {
        return f.substring(0,6) === 'index.';
      }
      function diskToRequire(rel) {
        return '/' + rel.replace(/\\/g,'/');
      }

      for(var i = 0,rel; (rel = client.paths.code[i]); ++i) {
        var p = path.join(ss.root, rel);
        //TODO if not exists error handling
        if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {

          var files = fs.readdirSync(p);
          var entry = files.filter(onlyModuleEntry);
          if (entry.length) {
            return diskToRequire(rel) + '/entry';
          }
          var index = files.filter(onlyModuleIndex);
          if (index && !firstIndex) {
            firstIndex = diskToRequire(rel) + '/';
          }
        }
        else {
          firstFile = diskToRequire(rel);
          firstFile = firstFile.substring(0, firstFile.length - path.extname(firstFile).length);
        }
      }

      return firstIndex || firstFile;
    },

    load: function() {
      for(var n in bundlers) {
        var bundler = bundlers[n];
        bundlerById[bundler.client.id] = bundler;

        if (bundler.load) {
            bundler.load();
        }
      }
    },

    unload: function() {
      for(var n in bundlers) {
        if (bundlers[n].unload) {
          bundlers[n].unload();
          bundlers[n].unload = null;
        }
      }
    },

    forget: function() {
      bundlerById = {};
      bundlers = {};
    },

    // API for implementing bundlers

    loadFile: function loadFile(entry, opts, formatter, cb, errCb) {
      var type = entry.assetType || entry.bundle;
      formatter = formatter || ss.client.formatters[entry.ext || type];
      if (!formatter) {
        throw new Error('Unsupported file extension \'.' + entry.ext + '\' when we were expecting some type of ' +
          ((type||'unknown').toUpperCase()) + ' file. Please provide a formatter for ' + (entry.file) + ' or move it to /client/static');
      }
      if (formatter.assetType !== type) {
        throw new Error('Unable to render \'' + entry.file + '\' as this appears to be a ' + (type.toUpperCase()) +
          ' file. Expecting some type of ' + (type.toUpperCase()) + ' file in ' + (path.dirname(entry.file)) + ' instead');
      }

      // Use the formatter to pre-process the asset before bundling
      try {
        return formatter.call(this.clientFilePath(entry.file), opts, cb, errCb);
      } catch (err) {
        return errCb(err);
      }
    },

    minifyCSS: function minifyCSS(files) {
      var origLength = 0;
      var minified = files.map(function(entry){
        origLength += entry.content.length;
        return new CleanCSS().minify(entry.content).styles; // this could also be an async call
      }).join('\n');
      log.info(('  Minified CSS from ' + (formatKb(origLength)) + ' to ' + (formatKb(minified.length))).grey);
      return minified;
    },

    minifyJS: function minifyJS_(files) {
      var that = this;
      var min = files.map(function(js) {
        return js.options.minified ? js.content : that.minifyJSFile(js.content);
      });
      return min.join('\n');
    },

    minifyJSFile: function minifyJSFile(originalCode, fileName) {
      var ast = uglifyjs.parse(originalCode, { filename:fileName });
      ast.figure_out_scope();
      ast = ast.transform(compressor);

      ast.figure_out_scope();
      ast.compute_char_frequency();
      ast.mangle_names();
      var minifiedCode = ast.print_to_string();
      if (fileName) {
        log.info(('  Minified ' + fileName + ' from ' + (formatKb(originalCode.length)) + ' to ' + (formatKb(minifiedCode.length))).grey);
      }
      return minifiedCode;
    },

    // input is decorated and returned
    sourcePaths: function(paths) {

      function relativePath(p, dirType) {
          var relativeStart = p.indexOf('./') === 0 || p.indexOf('../') === 0;
          return relativeStart? prefixPath(options.dirs.client,p) : prefixPath(options.dirs[dirType], p);
      }

      function prefixPath(base,p) {
          base = base.replace(/^\//,'');
          if (p === '*') {
            return base;
          }
          p = p.replace(/\/\*$/,'');
          return path.join(base,p);
      }

      function entries(from, dirType) {
        if (from == null) {
          return [];
        }
        var list = (from instanceof Array)? from : [from];

        return list.map(function(value) {
          return relativePath(value, dirType);
        });
      }

      paths.css = entries(paths.css, 'css');
      paths.code = entries(paths.code, 'code');
      paths.tmpl = entries(paths.tmpl || paths.templates, 'templates');

      if (paths.view) {
        paths.view = relativePath(paths.view, 'views');
      }

      return paths;
    },

      /**
       * @ngdoc method
       * @name ss.bundler:bundler#destsFor
       * @methodOf ss.bundler:bundler
       * @function
       * @description
       * The define client method of all bundlers must return the file locations for the client.
       *
       *     return ss.bundler.destsFor(client);
       *
       * To offer a very different way to define the entry-points for assets the bundler can tweak
       * the paths or replace them.
       * @param {object} client Object describing the client.
       * @returns {object} Destinations paths, relPaths, dir, containerDir
       */
    destsFor: function(client) {
      var containerDir = path.join(ss.root, options.dirs.assets);
      var clientDir = path.join(containerDir, client.name);
      var assetsUrl = options.urls.assets;

      return {

        //TODO perhaps mixin the abs versions by SS
        urls: {
          html: assetsUrl + client.name + '/' + client.id + '.html',
          js: assetsUrl + client.name + '/' + client.id + '.js',
          css: assetsUrl + client.name + '/' + client.id + '.css'
        },
        paths: {
          html: path.join(clientDir, client.id + '.html'),
          js: path.join(clientDir, client.id + '.js'),
          css: path.join(clientDir, client.id + '.css')
        },
        relPaths: {
          html: path.join(options.dirs.assets, client.name, client.id + '.html'),
          js: path.join(options.dirs.assets, client.name, client.id + '.js'),
          css: path.join(options.dirs.assets, client.name, client.id + '.css')
        },
        dir: clientDir,
        containerDir: containerDir
      };
    },

    /**
     @param bundle {String} tmpl/code/css
     @param file {String} Path relative to project
     */
    entryFor: function(bundle,file,part2) {
      var result = {
        bundle: bundle,
        file:file
      };
      if (part2) {
        if (part2.charAt(0) !== '/') {
          part2 = '/' + part2;
        }
        result.file = file + part2;
      }

      switch(bundle) {
        case 'tmpl':
          result.assetType = 'html';
          break;
        case 'worker':
          result.assetType = 'js';
          break;
      }

      var extension = path.extname(result.file);
      result.ext = extension? extension.substring(1) : (result.assetType || result.bundle);

      return result;
    },

    browserifyLoader: function() {
      if (!this.browserifyContent) {
        this.browserifyContent = fs.readFileSync(path.join(__dirname,'browserify.client.js'),'utf8');
      }
      return {
        type: 'mod',
        file: 'loader',
        includeType: 'system',
        names: ['browserify.client.js'],
        content: this.browserifyContent
      };
    },

    /**
     * @ngdoc method
     * @name ss.bundler:bundler#systemLibs
     * @methodOf ss.bundler:bundler
     * @function
     * @description
     * A single entry for all system libraries.
     *
     * @returns {AssetEntry} Entry
     */
    systemLibs: function() {
      var names = [];
      return {
        type: 'mod',
        file: 'libs',
        includeType: 'system',
        names: names,
        content: system.assets.libs.map(function(lib) { names.push(lib.name); return lib.content; }).join('\n')
      };
    },

    /**
     * @ngdoc method
     * @name ss.bundler:bundler#systemModule
     * @methodOf ss.bundler:bundler
     * @function
     * @description
     * Describe a system module.
     *
     * @param {String} name Name of the system module to return in a descriptor
     * @param {boolean} wrap Shall the content be wrapped in `require.define`. Default is true.
     * @returns {AssetEntry} Entry
     */
    systemModule: systemModule,

    systemModules: function(wrap) {
      return Object.keys(system.assets.modules).map(function(name) {
        return systemModule(name,wrap);
      });
    },

    constants: function(client) {
      var constants = {}, k;

      // mixin system constants
      for(k in system.assets.constants) {
        constants[k] = system.assets.constants[k];
      }

      // mixin client constants
      if (client.constants) {
        for(k in client.constants) {
          constants[k] = describeConstant(k, client.constants[k]);
        }
      }

      function describeConstant(key,value) {
        var desc = { name:key, value:value, type:'constant' };
        // perhaps add, value = function support
        return desc;
      }

      // list of constants
      var list = [];
      for(k in constants) {
        constants[k].content = 'var '+constants[k].name+'='+ JSON.stringify(constants[k].value) +';';
        list.push(constants[k]);
      }
      return list;
    },

    /**
     * Default start/init codes to load the client view.
     *
     * Called in default bundler startCode.
     *
     * @param client Client Object
     * @returns {[{content: *, options: {}, type:'start'}]} Single Entry for inclusion in entries()
     */
    startCode: function(client) {
      var startCode = system.assets.startCode.map(function(ic) { return ic.content; }),
        entryInit = client.entryInitPath? 'require("' + client.entryInitPath + '");' : options.defaultEntryInit;

      if (typeof options.entryModuleName === 'string' || options.entryModuleName === null) {
        entryInit = options.entryModuleName? 'require("/'+options.entryModuleName+'");' : '';
      }

      startCode.push(entryInit);

      return [{ content: startCode.join('\n'), options: {}, type: 'start', includeType:'initCode' }];
    },

    packAssetSet: function packAssetSet(assetType, client, postProcess, done) {
      var bundler = getBundler(client);

      async.mapSeries(bundler.entries(assetType,system.assets), iterator, andThen);

      function iterator(entry, callback) {
        var options = {
          constants: bundler.constants(),
          locals: bundler.locals(),
          //pathPrefix: entry.importedBy,
          compress: true
        };
        if (typeof entry.content === "string") {
          callback(null, {content:entry.content,options:{}});
        }
        else {
          bundler.asset(entry, options, function(output) {
            //TODO if err, flag has errors
            callback(null, {content:output,options:{}});
          });
        }
      }

      function andThen(err, results) {
        var fileName = bundler.dests.paths[assetType];
        fs.writeFileSync(fileName, postProcess(results.filter(function(f) { return f.content && f.content !== ';'; })));
        log.info('✓'.green, 'Packed', results.length, 'files into', bundler.dests.relPaths[assetType]);
        done();
      }
    },

    /**
     * Make a list of asset entries for JS/CSS bundle.
     *
     * @param client
     * @param assetType
     * @returns {Array}
     */
    entries: function entries(client, assetType) {

      var _entries = [],
          bundler = getBundler(client),
          includeType,
          bundle;

      switch(assetType) {
        case 'css':
          includeType = 'css';
          bundle = 'css';
          client.paths['css'].forEach(pushMainEntries);
          break;

        case 'js':
        case 'worker':
          var loader = bundler.module('loader');
          var libs = bundler.module('libs');
          var mods = bundler.module.apply(bundler, Object.keys(system.assets.modules));

          _entries = _entries.concat(loader).concat(libs).concat(mods);
          includeType = false;
          bundle = 'js';
          //TODO worker instead of code ?
          client.paths.code.forEach(pushMainEntries);
          if (options.startInBundle) {
            _entries = _entries.concat(bundler.module('start'));
          }
          break;

        case 'tmpl':
          includeType = 'html';
          bundle = 'tmpl';
          client.paths.tmpl.forEach(pushMainEntries);
          break;
      }

      function pushMainEntries(from) {
        var p = path.join(ss.root,from);
        if (!fs.existsSync(p) || fs.statSync(p).isFile()) {
          p = from;
        } else {
          p = path.join(from,'**','*');
        }
        return glob.sync(p, {cwd:ss.root}).forEach(function(file) {
          var extension = path.extname(file);
          extension = extension && extension.substring(1); // argh!
          var assetType = bundle==='tmpl'? 'html':bundle;
          var entry = {file:file,importedBy:from,includeType:includeType,ext:extension,bundle:bundle,assetType:assetType};
          if (isAssetType(entry)) {
            _entries.push(entry);
          }
        });
      }

      function isAssetType(entry) {
        if (ss.client.formatters == null) {
          return false;
        }
        var formatter = ss.client.formatters[entry.ext];
        if (formatter == null) {
          return false;
        }
        if (formatter.assetType === undefined) {
          throw new Error('Unable to render \''+entry.file+'\' as the formatter has no asset type.');
        }
        return formatter.assetType === entry.assetType;
      }

      // entries with blank ones stripped out
      return _entries.filter(function(entry) {
        return !!entry;
      });
    },

    injectTailIfNeeded: function(output,opts) {
      // If passing optional tails for main view
      if (opts && opts.tail && !options.startInBundle) {
        output = output.replace('</body>', opts.tail + '</body>');
        output = output.replace('</BODY>', opts.tail + '</BODY>');
      }
      return output;
    },

    clientFilePath: function(rel) {
      if (typeof rel === 'object') {
        // entry object
        rel = rel.file;
      }
      return path.join(ss.root,rel);
    },

    formatKb: formatKb,

    wrapModule: function(modPath, code) {
      return 'require.define("' + modPath + '", function (require, module, exports, __dirname, __filename){\n' + code + '\n});';
    }

  };
};

function formatKb(size) {
  return '' + (Math.round((size / 1024) * 1000) / 1000) + ' KB';
}
