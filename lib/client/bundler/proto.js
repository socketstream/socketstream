'use strict';
// prototype for bundlers created with ss.bundler.create(..)

var fs = require('fs'),
    path = require('path'),
    system = require('../system');

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

      case 'mod':
      case 'module':
        url += 'mod='+entry.file;
        break;

      case 'start':
        url += 'mod=start';
        break;

      default:
        url += '_='+entry.file;
        break;
    }

    return '<script src="' + url + '" type="text/javascript"></script>';
  }
};


module.exports = function(ss, bundlers, bundlerById, options) {

  return {
    /**
     * @ngdoc method
     * @name bundler.default:default#load
     * @methodOf bundler.default:default
     * @function
     * @description
     * Called when the server is started. Does nothing.
     */
    load: function() {},

    /**
     * @ngdoc method
     * @name bundler.default:default#unload
     * @methodOf bundler.default:default
     * @function
     * @description
     * Called when the server is stopped. Does nothing.
     */
    unload: function() {},

    entries: entries,
    toMinifiedCSS: toMinifiedCSS,
    toMinifiedJS: toMinifiedJS,

    constants: constants,
    locals: locals,
    htmlTags: htmlTags,

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
    },

    wrapCode: wrapCode,

    format: function(entry, options, formatter,cb, errCb) {
      ss.bundler.loadFile(entry,options,formatter,cb, errCb); //TODO call loadFile 'html'
    },

    clientFilePath: function(rel) {
      return ss.bundler.clientFilePath(rel);
    },

    entryFor: function(bundle,file) {
      return ss.bundler.entryFor(bundle,file);
    }
  };

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

  /**
   * @ngdoc method
   * @name bundler.default:default#entries
   * @methodOf bundler.default:default
   * @function
   * @description
   * Provides the view and the pack functions with a
   * list of entries for an asset type relative to the client directory.
   * The default implementation is used.
   *
   * An entry describes:
   * - file: source file name relative to client directory
   * - importedFrom: Pulled in by require in other file
   * - content: If pre-loaded
   * - type: If system asset it will have type lib/mod
   * - bundle: which production bundle (html, tmpl, css, js, worker)
   * - assetType: css, js, html
   * - extension: source file extension
   *
   * @param {String} assetType js/css/tmpl
   * @param {Object} systemAssets Collection of libs, modules, initCode
   * @returns {[AssetEntry]} List of output entries
   */
  function entries(assetType,systemAssets) {
    var includes = this.client.includes;
    return ss.bundler.entries(this.client, assetType, systemAssets).filter(function(entry) {
      return entry.includeType? includes[entry.includeType] : true;
    });
  }

  function constants() {
    var result = {}, k;

    // mixin system constants
    for(k in system.assets.constants) {
      result[k] = system.assets.constants[k].value;
    }

    // mixin client constants
    var client = this.client;
    if (client.constants) {
      for(k in client.constants) {
        result[k] = client.constants[k];
      }
    }

    return result;
  }

  function locals() {
    var result = {}, k;

    // mixin system locals
    for(k in system.assets.locals) {
      result[k] = system.assets.locals[k].value;
    }

    // mixin client constants
    var client = this.client;
    if (client.locals) {
      for(k in client.locals) {
        result[k] = client.locals[k];
      }
    }

    return result;
  }

  /**
   * @ngdoc method
   * @name bundler.default:default#htmlTags
   * @methodOf bundler.default:default
   * @function
   * @description
   * Function called by view.js to build the view HTML
   *
   *
   * @param {String} type Either start/js/css
   * @param {Boolean} pack Pack with resolveAssetLink ?
   * @returns {[String]} List of script tag strings
   */
  function htmlTags(type,pack) {
    var dests;

    if (type === 'start') {
      return ['<script>' + this.module('start').map(function(value) { return value.content; }).join('\n') + '</script>'];
    }

    if (pack) {
      dests = { urls: {} };
      dests.urls[type] = resolveAssetLink(this.client, type);
      return [ htmlTag[type](dests) ];
    } else {
      var entries = this.entries(type);
      dests = this.dests;
      return entries.map(function(entry) {
        return htmlTag[type](dests,entry);
      });
    }
  }

  /**
   * @ngdoc method
   * @name bundler.default:default#wrapCode
   * @methodOf bundler.default:default
   * @function
   * @description
   * Before client-side code is sent to the browser any file which is NOT a library (e.g. /client/code/libs)
   * is wrapped in a module wrapper (to keep vars local and allow you to require() one file in another).
   *
   * The 'system' directory is a special case - any module placed in this dir will not have a leading slash
   *
   * @param {String} assetType js/css/tmpl
   * @param {Object} systemAssets Collection of libs, modules, initCode
   * @returns {[AssetEntry]} List of output entries
   */
  function wrapCode(code, entry, opts) {
    var pathAry = entry.file.split('/');

    pathAry[0] = ''; // remove leading .

    // Don't touch the code if it's in a 'libs' directory
    if (pathAry.indexOf('libs') >= 0) { //TODO [code,libs] & options.dirs.libs location
      return code;
    }

    if (pathAry.indexOf('entry.js') === -1 && options && options.browserifyExcludePaths) {
      for(var i, p; (p = options.browserifyExcludePaths[i]); ++i) {
        if ( entry.file.split( p )[0] === '' ) {
          return code;
        }
      }
    }

    var last = pathAry[pathAry.length-1],
      modPath,
      systemRel = path.relative(options.dirs.client, options.dirs['system']),
      extPos = last.lastIndexOf('.');
    if (extPos > -1) {
      pathAry[pathAry.length-1] = last.substring(0,extPos);
    }

    // Don't add a leading slash if this is a 'system' module
    if (entry.file.indexOf(systemRel) === 2) { //TODO [code,system] & improve test to allow parallel system dir
      // Take everything after the /system/ part of the path
      modPath = pathAry.slice(pathAry.indexOf('system')+1).join('/');
    } else {

      // Otherwise treat as a regular module
      modPath = pathAry.join('/');

      // Work out namespace for module
      if (opts.pathPrefix) {

        // Ignore any filenames in the path
        if (opts.pathPrefix.indexOf('.') > 0) {
          var sp = opts.pathPrefix.split('/');
          sp.pop();
          opts.pathPrefix = sp.join('/');
        }
        modPath = '/' + path.substr(opts.pathPrefix.length + 1);
      }
    }
    return ss.bundler.wrapModule(modPath, code);
  }

  /**
   * @ngdoc method
   * @name bundler.default:default#toMinifiedCSS
   * @methodOf bundler.default:default
   * @function
   * @description
   * Minify JavaScript using CleanCSS
   *
   * @param {Array} files Entries with file path and content to be minified
   * @returns {String} Minified content
   */
  function toMinifiedCSS(files) {
    return ss.bundler.minifyCSS(files);
  }

  /**
   * @ngdoc method
   * @name bundler.default:default#toMinifiedJS
   * @methodOf bundler.default:default
   * @function
   * @description
   * Minify JavaScript using Uglify
   *
   * @param {Array} files Entries with file path and content to be minified
   * @returns {String} Minified content
   */
  function toMinifiedJS(files) {
    return ss.bundler.minifyJS(files);
  }

};
