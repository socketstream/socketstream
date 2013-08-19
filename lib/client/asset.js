// Client Asset File
// -----------------
// An asset is a Code (JS or CoffeeScript), CSS or HTML file

var formatKb, formatters, fs, jsp, log, minifyJSFile, pathlib, pro, uglifyjs, wrap, wrapCode,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

log = console.log;

fs = require('fs');

pathlib = require('path');

uglifyjs = require('uglify-js');

formatters = require('./formatters');

wrap = require('./wrap');

jsp = uglifyjs.parser;

pro = uglifyjs.uglify;

// Load, compile and minify the following assets

module.exports = function(ss, options) {
  var loadFile;
  loadFile = function(dir, fileName, type, options, cb) {
    var extension, formatter, path;
    dir = pathlib.join(ss.root, dir);
    path = pathlib.join(dir, fileName);
    extension = pathlib.extname(path);
    extension = extension && extension.substring(1); // argh!
    formatter = ss.client.formatters[extension];
    if (path.substr(0, dir.length) !== dir) {
      throw new Error("Invalid path. Request for " + path + " must not live outside " + dir);
    }
    if (!formatter) {
      throw new Error("Unsupported file extension '." + extension + "' when we were expecting some type of " + (type.toUpperCase()) + " file. Please provide a formatter for " + (path.substring(root.length)) + " or move it to /client/static");
    }
    if (formatter.assetType !== type) {
      throw new Error("Unable to render '" + fileName + "' as this appears to be a " + (formatter.assetType.toUpperCase()) + " file. Expecting some type of " + (type.toUpperCase()) + " file in " + (dir.substr(root.length)) + " instead");
    }
    return formatter.compile(path.replace(/\\/g, '/'), options, cb);
  };
  return {

    // Public

    js: function(path, opts, cb) {
      return loadFile(options.dirs.code, path, 'js', opts, function(output) {
        output = wrapCode(output, path, opts.pathPrefix);
        if (opts.compress && !path.indexOf('.min') >= 0) {
          output = minifyJSFile(output, path);
        }
        return cb(output);
      });
    },
    worker: function(path, opts, cb) {
      return loadFile(options.dirs.workers, path, 'js', opts, function(output) {
        if (opts.compress) {
          output = minifyJSFile(output, path);
        }
        return cb(output);
      });
    },
    css: function(path, opts, cb) {
      return loadFile(options.dirs.css, path, 'css', opts, cb);
    },
    html: function(path, opts, cb) {
      return loadFile(options.dirs.views, path, 'html', opts, cb);
    }
  };
};

// PRIVATE

formatKb = function(size) {
  return "" + (Math.round((size / 1024) * 1000) / 1000) + " KB";
};

minifyJSFile = function(originalCode, fileName) {
  var ast, minifiedCode;
  ast = jsp.parse(originalCode);
  ast = pro.ast_mangle(ast);
  ast = pro.ast_squeeze(ast);
  minifiedCode = pro.gen_code(ast);
  log(("  Minified " + fileName + " from " + (formatKb(originalCode.length)) + " to " + (formatKb(minifiedCode.length))).grey);
  return minifiedCode;
};

// Before client-side code is sent to the browser any file which is NOT a library (e.g. /client/code/libs)
// is wrapped in a module wrapper (to keep vars local and allow you to require() one file in another).
// The 'system' directory is a special case - any module placed in this dir will not have a leading slash
wrapCode = function(code, path, pathPrefix) {
  var modPath, pathAry, sp;
  pathAry = path.split('/');

  // Don't touch the code if it's in a 'libs' directory
  if (__indexOf.call(pathAry, 'libs') >= 0) {
    return code;
  }

  // Don't add a leading slash if this is a 'system' module  
  if (__indexOf.call(pathAry, 'system') >= 0) {
    modPath = pathAry[pathAry.length - 1];
    return wrap.module(modPath, code);
  } else {

    // Otherwise treat as a regular module
    modPath = pathAry.slice(1).join('/');

    // Work out namespace for module
    if (pathPrefix) {
      
      // Ignore any filenames in the path
      if (pathPrefix.indexOf('.') > 0) {
        sp = pathPrefix.split('/');
        sp.pop();
        pathPrefix = sp.join('/');
      }
      modPath = path.substr(pathPrefix.length + 1);
    }
    return wrap.module('/' + modPath, code);
  }
};
