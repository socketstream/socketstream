// Client-Side Bundler of assets in development and production
'use strict';

var fs = require('fs'),
    path = require('path'),
    log = require('../../utils/log'),
    cleanCSS = require('clean-css'),
    system = require('../system'),
    view = require('../view'),
    magicPath = require('../magic_path'),
    uglifyjs = require('uglify-js'),
    jsp = uglifyjs.parser,
    pro = uglifyjs.uglify;

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

  var proto = require('./proto')(ss, bundlers, bundlerById, options);

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
          pathsOrFunc = args[1],
          bundler;

      if (typeof pathsOrFunc === "function") {
        bundler = bundlers[name] = pathsOrFunc(ss,options);
        bundler.client = client;
        bundler.dests = bundler.define(client, args[2], args[3], args[4], args[5]);
      } else {
        bundler = bundlers[name] = require('./default')(ss,client,options);
        bundler.client = client;
        bundler.dests = bundler.define(args[1]);
      }
      bundlerById[client.id] = bundler;
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

      for(var i = 0,rel; (rel = client.paths.code[i]); ++i) {
        var p = path.join(ss.root, options.dirs.client, rel);
        if (fs.statSync(p).isDirectory()) {

          var files = fs.readdirSync(p);
          var entry = files.filter(function(f) { return f.substring(0,6) === 'entry.';});
          if (entry.length) {
            return rel.substring(1 /* skipping . */).replace('\\','/') + '/entry';
          }
          var index = files.filter(function(f) { return f.substring(0,6) === 'index.';});
          if (index && !firstIndex) {
            firstIndex = rel.substring(1 /* skipping . */).replace('\\','/') + '/';
          }
        }
        else {
          firstFile = rel.substring(1 /* skipping . */).replace('\\','/');
          firstFile = firstFile.substring(0, firstFile.length - path.extname(firstFile).length);
        }
      }

      return firstIndex || firstFile;
    },

    load: function() {
      for(var n in bundlers) {
        bundlers[n].determineLatestsPackedId();
        if (bundlers[n].load) {
            bundlers[n].load();
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

    pack: function pack(client) {
      client.pack = true;

      // the concrete bundler for the client
      var bundler = getBundler(client);

      /* PACKER */

      ss.log.info(('Pre-packing and minifying the \'' + client.name + '\' client...').yellow);

      // Prepare folder
      mkdir(bundler.dests.containerDir);
      mkdir(bundler.dests.dir);
      if (!(options.packedAssets && options.packedAssets.keepOldFiles)) {
        deleteOldFiles(bundler.dests.dir);
      }

      // Output CSS
      ss.bundler.packAssetSet('css', client, bundler.toMinifiedCSS);

      // Output JS
      ss.bundler.packAssetSet('js', client, bundler.toMinifiedJS);

      // Output HTML view
      return view(ss, client, options, function(html) {
        fs.writeFileSync(bundler.dests.paths.html, html);
        return ss.log.info('✓'.green, 'Created and cached HTML file ' + bundler.dests.relPaths.html);
      });
    },


    // API for implementing bundlers

    loadFile: function loadFile(entry, opts, formatter, cb, errCb) {
      var type = entry.assetType || entry.bundle;
      formatter = formatter || ss.client.formatters[entry.ext];
      if (!formatter) {
        throw new Error('Unsupported file extension \'.' + entry.ext + '\' when we were expecting some type of ' +
          (type.toUpperCase()) + ' file. Please provide a formatter for ' + (entry.file) + ' or move it to /client/static');
      }
      if (formatter.assetType !== type) {
        throw new Error('Unable to render \'' + entry.file + '\' as this appears to be a ' + (formatter.assetType.toUpperCase()) +
          ' file. Expecting some type of ' + (type.toUpperCase()) + ' file in ' + (path.dirname(entry.file)) + ' instead');
      }

      // Use the formatter to pre-process the asset before bundling
      try {
        return formatter.call(this.clientFilePath(entry.file), opts, function(output) {
          return cb(output);
        }, function(err) {
          return errCb(err);
        });
      } catch (err) {
        return errCb(err);
      }
    },

    minifyCSS: function minifyCSS(files) {
      var original = files.join('\n');
      var minified = cleanCSS().minify(original);
      log.info(('  Minified CSS from ' + (formatKb(original.length)) + ' to ' + (formatKb(minified.length))).grey);
      return minified;
    },

    minifyJS: function minifyJS_(files) {
      var min = files.map(function(js) {
        return js.options.minified ? js.content : minifyJS(js.content);
      });
      return min.join('\n');
    },

    minifyJSFile: function minifyJSFile(originalCode, fileName) {
      var ast = jsp.parse(originalCode);
      ast = pro.ast_mangle(ast);
      ast = pro.ast_squeeze(ast);
      var minifiedCode = pro.gen_code(ast);
      log.info(('  Minified ' + fileName + ' from ' + (formatKb(originalCode.length)) + ' to ' + (formatKb(minifiedCode.length))).grey);
      return minifiedCode;
    },

    // input is decorated and returned
    sourcePaths: function(paths) {

      function entries(from, dirType) {
        if (from == null) {
          return [];
        }
        var list = (from instanceof Array)? from : [from];

        return list.map(function(value) {
          var relClient = path.relative(options.dirs.client, options.dirs[dirType]);
          return value.substring(0,2) === './'? value : './' + path.join(relClient, value);
        });
      }

      paths.css = entries(paths.css, 'css');
      paths.code = entries(paths.code, 'code');
      paths.tmpl = entries(paths.tmpl || paths.templates, 'templates');

      var relClient = path.relative(options.dirs.client, options.dirs['views']);
      if (paths.view) {
        paths.view = paths.view.substring(0,2) === './'? paths.view : './' + path.join(relClient, paths.view);
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
        type: 'loader',
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
    systemModule: function(name,wrap) {
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
      var startCode = system.assets.startCode.map(function(ic) { return ic.content; }).join('\n'),
        entryInit = options.defaultEntryInit,
        realInit = client.entryInitPath? 'require("' + client.entryInitPath + '");' : null;

      if (typeof options.entryModuleName === 'string' || options.entryModuleName === null) {
        realInit = options.entryModuleName? 'require("/'+options.entryModuleName+'");' : '';
      }

      if (realInit !== null) {
          startCode = startCode.replace(entryInit, realInit);
      }
      //TODO convert require calls \ to /
      return [{ content:startCode, options: {}, type: 'start', includeType:'initCode' }];
    },

    packAssetSet: function packAssetSet(assetType, client, postProcess) {
      var bundler = getBundler(client),
          filePaths = bundler.entries(assetType,system.assets);

      function writeFile(fileContents) {
        var fileName = bundler.dests.paths[assetType];
        fs.writeFileSync(fileName, postProcess(fileContents));
        return log.info('✓'.green, 'Packed', filePaths.length, 'files into', bundler.dests.relPaths[assetType]);
      }

      function processFiles(fileContents, i) {
        if (!fileContents) {
          fileContents = [];
        }
        if (!i) {
          i = 0;
        }
        if (filePaths.length === 0) {
            return writeFile([]);
        }

        var entry = filePaths[i];
        //TODO review assetType vs bundle
        return bundler.asset(bundler.entryFor(assetType, entry.file), {
          constants: bundler.constants(),
          locals: bundler.locals(),
          pathPrefix: entry.importedBy,
          compress: true
        }, function(output) {
          fileContents.push({content:output,options:{}});
          if (filePaths[++i]) {
            return processFiles(fileContents, i);
          } else {
            return writeFile(fileContents);
          }
        });
      }

      return processFiles();
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
          // Libs
          var libs = bundler.module('loader');

          // Modules
          var mods = bundler.module.apply(bundler, Object.keys(system.assets.modules));

          _entries = _entries.concat(libs).concat(mods);
          includeType = false;
          //TODO worker instead of code ?
          client.paths['code'].forEach(pushMainEntries);
          if (options.startInBundle) {
            _entries = _entries.concat(bundler.module('start'));
          }
          _entries = _entries.map(function(entry) {
            var extension = path.extname(entry.file);
            extension = extension && extension.substring(1); // argh!
            entry.ext = extension;
            entry.assetType = 'js';
            entry.bundle = 'js';
            return entry;
          });
          break;

        case 'tmpl':
          includeType = 'html';
          bundle = 'tmpl';
          client.paths.tmpl.forEach(function(tmpl) {
            if (tmpl.substring(tmpl.length-2) === '/*') {
              var matching = magicPath.files(path.join(ss.root,options.dirs.client,tmpl.substring(0,tmpl.length-2)), '*');
              matching.map(function(p) { return './' + path.join(tmpl.substring(0,tmpl.length-2),p); }).forEach(pushMainEntries);
            }
            else {
              pushMainEntries(tmpl);
            }
          });
          break;
      }

      function pushMainEntries(from) {
        return magicPath.files(path.join(ss.root, options.dirs.client), from).forEach(function(file) {
          var extension = path.extname(file);
          extension = extension && extension.substring(1); // argh!
          var assetType = bundle==='tmpl'? 'html':bundle
          return _entries.push({file:file,importedBy:from,includeType:includeType,ext:extension,bundle:bundle,assetType:assetType});
        });
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
      return path.join(ss.root,options.dirs.client,rel);
    },

    formatKb: formatKb,

    wrapModule: function(modPath, code) {
      return 'require.define("' + modPath + '", function (require, module, exports, __dirname, __filename){\n' + code + '\n});';
    }

  };
};

function deleteOldFiles(clientDir) {
  var filesDeleted = fs.readdirSync(clientDir).map(function(fileName) {
      return fs.unlinkSync(path.join(clientDir, fileName));
    });
  return filesDeleted.length > 1 && log('✓'.green, '' + filesDeleted.length + ' previous packaged files deleted');
}

function mkdir(dir) {
  if (!fs.existsSync(dir)) {
    return fs.mkdirSync(dir);
  }
}

function formatKb(size) {
  return '' + (Math.round((size / 1024) * 1000) / 1000) + ' KB';
}

// Private
function minifyJS(originalCode) {
  var ast, jsp, pro;
  jsp = uglifyjs.parser;
  pro = uglifyjs.uglify;
  ast = jsp.parse(originalCode);
  ast = pro.ast_mangle(ast);
  ast = pro.ast_squeeze(ast);
  return pro.gen_code(ast) + ';';
}
