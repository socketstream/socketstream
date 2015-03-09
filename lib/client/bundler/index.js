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
 * @typedef { name:string, path:string, dir:string, content:string, options:string, type:string } AssetEntry
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

var htmlTag = {
  css: function(dests,entry) {
    var url = entry? (dests.urls.css + '?_=' + entry.file) : dests.urls.css;
    return '<link href="' + url + '" media="screen" rel="stylesheet" type="text/css">';
  },
  js: function(dests,entry) {
    var url = dests.urls.js + '?';
    switch(entry? entry.type : null) {
      case null:
        url = dests.urls.js;
        break;
      case 'loader':
        url += 'loader=-';
        break;

      case 'mod':
      case 'module':
        url += 'mod='+entry.file;
        break;

      case 'start':
        url += 'start';
        break;

      default:
        url += '_='+entry.file;
        break;
    }

    return '<script src="' + url + '" type="text/javascript"></script>';
  }
};

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

  // When packing assets the default path to the CSS or JS file can be overridden
  // either with a string or a function, typically pointing to an resource on a CDN
  function resolveAssetLink(client, type) {
    var defaultPath = '/assets/' + client.name + '/' + client.id + '.' + type,
        pack = options.packedAssets,
        link = pack !== undefined ? (pack.cdn !== undefined ? pack.cdn[type] : void 0) : void 0;
    if (link) {
      if (typeof link === 'function') {
        var file = {
          id: client.id,
          name: client.name,
          extension: type,
          path: defaultPath
        };
        return link(file);
      } else if (typeof link === 'string') {
        return link;
      } else {
        throw new Error('CDN ' + type + ' param must be a Function or String');
      }
    } else {
      return defaultPath;
    }
  }

  var proto = {
    htmlTags: function(type,pack) {
      var dests;

      if (pack) {
        dests = { urls: {} };
        dests.urls[type] = resolveAssetLink(this.client, type);
        return [ htmlTag[type](dests) ];
      } else {
        var entries = this.asset.entries(type);
        dests = this.dests;
        return entries.map(function(entry) {
          return htmlTag[type](dests,entry);
        });
      }
    },

    // TODO: Improve to test for complete set
    //TODO: Update for new id scheme
    // Very basic check to see if we can find pre-packed assets
    determineLatestsPackedId : function() {
      try {
        var files = fs.readdirSync(path.join(ss.root, options.dirs.assets, this.client.name));
        var latestId = files.sort().pop();
        var id = latestId.split('.')[0];
        if (id.length !== 9) {
          throw 'Invalid Client ID length';
        }
        this.latestPackedId = id;
      } catch (e) {
        this.latestPackedId = false;
      }
    }
  };


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

      log(('Pre-packing and minifying the \'' + client.name + '\' client...').yellow);

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
        return log.info('✓'.green, 'Created and cached HTML file ' + bundler.dests.relPaths.html);
      });
    },


    // API for implementing bundlers

    loadFile: function loadFile(fileName, type, opts, cb) {
      var dir = path.join(ss.root, options.dirs.client);
      var p = path.join(dir, fileName);
      var extension = path.extname(p);
      extension = extension && extension.substring(1); // argh!
      var formatter = ss.client.formatters[extension];
      if (p.substr(0, dir.length) !== dir) {
        throw new Error('Invalid path. Request for ' + p + ' must not live outside ' + dir);
      }
      if (!formatter) {
        throw new Error('Unsupported file extension \'.' + extension + '\' when we were expecting some type of ' + (type.toUpperCase()) + ' file. Please provide a formatter for ' + (p.substring(ss.root.length)) + ' or move it to /client/static');
      }
      if (formatter.assetType !== type) {
        throw new Error('Unable to render \'' + fileName + '\' as this appears to be a ' + (formatter.assetType.toUpperCase()) + ' file. Expecting some type of ' + (type.toUpperCase()) + ' file in ' + (dir.substr(ss.root.length)) + ' instead');
      }
      return formatter.compile(p.replace(/\\/g, '/'), opts, cb);
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

    /**
     * Default start/init codes to load the client view.
     *
     * Called in default bundler startCode.
     *
     * @param client Client Object
     * @returns {{content: *, options: {}}} Single Entry for inclusion in entries()
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
      return { content:startCode, options: {}, type: 'start', includeType:'initCode' };
    },

    packAssetSet: function packAssetSet(assetType, client, postProcess) {
      var bundler = getBundler(client),
          filePaths = bundler.asset.entries(assetType,system.assets);

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

        var _ref = filePaths[i], path = _ref.importedBy, file = _ref.file;
        return bundler.asset[assetType](file, {
          pathPrefix: path,
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
          includeType;

      switch(assetType) {
        case 'css':
          includeType = 'css';
          client.paths['css'].forEach(pushMainEntries);
          break;

        case 'js':
        case 'worker':
          // Libs
          var libs = [bundler.asset.loader()];

          // Modules
          var mods = [],
            _ref = system.assets.modules;
          for (var name in _ref) {
            if (_ref.hasOwnProperty(name)) {
              mods.push( bundler.asset.systemModule(name) );
            }
          }
          _entries = _entries.concat(libs).concat(mods);
          includeType = false;
          client.paths['code'].forEach(pushMainEntries);
          _entries.push(bundler.asset.start());
          break;
      }

      function pushMainEntries(from) {
        return magicPath.files(path.join(ss.root, options.dirs.client), from).forEach(function(file) {
          return _entries.push({file:file,importedBy:from,includeType:includeType});
        });
      }

      // entries with blank ones stripped out
      return _entries.filter(function(entry) {
        return !!entry;
      });
    },

    formatKb: formatKb,

    wrapModule: function(modPath, code) {
      return 'require.define("' + modPath + '", function (require, module, exports, __dirname, __filename){\n' + code + '\n});';
    },

    // Before client-side code is sent to the browser any file which is NOT a library (e.g. /client/code/libs)
    // is wrapped in a module wrapper (to keep vars local and allow you to require() one file in another).
    // The 'system' directory is a special case - any module placed in this dir will not have a leading slash
    wrapCode: function wrapCode(code, path, pathPrefix) {
      var pathAry = path.split('/');

      // Don't touch the code if it's in a 'libs' directory
      if (pathAry.indexOf('libs') >= 0) {
        return code;
      }

      if (pathAry.indexOf('entry.js') === -1 && options && options.browserifyExcludePaths) {
        //TODO is this an array? should be revised
        for(var p in options.browserifyExcludePaths) {
          if (options.browserifyExcludePaths.hasOwnProperty(p)) {
            if ( path.split( options.browserifyExcludePaths[p] )[0] === '' ) {
              return code;
            }
          }
        }
      }

      // Don't add a leading slash if this is a 'system' module
      if (pathAry.indexOf('system') >= 0) {
        return ss.bundler.wrapModule(pathAry[pathAry.length - 1], code);
      } else {

        // Otherwise treat as a regular module
        var modPath = /*options.globalModules? pathAry.join("/") :*/ pathAry.slice(1).join('/');

        // Work out namespace for module
        if (pathPrefix) {

          // Ignore any filenames in the path
          if (pathPrefix.indexOf('.') > 0) {
            var sp = pathPrefix.split('/');
            sp.pop();
            pathPrefix = sp.join('/');
          }
          modPath = path.substr(pathPrefix.length + 1);
        }
        return ss.bundler.wrapModule('/' + modPath, code);
      }
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
