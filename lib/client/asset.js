var formatKb, formatters, fs, loadFile, log, minifyJS, minifyJSFile, pathlib, uglifyjs, wrapCode, wrapModule,
  __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

log = console.log;

fs = require('fs');

pathlib = require('path');

uglifyjs = require('uglify-js');

formatters = require('./formatters');

exports.init = function(root, options) {
  return {
    js: function(path, opts, cb) {
      return loadFile(root, options.dirs.code, path, 'js', opts, function(output) {
        output = wrapCode(output, path, opts.pathPrefix);
        if (opts.compress && !path.indexOf('.min') >= 0) {
          output = minifyJSFile(output, path);
        }
        return cb(output);
      });
    },
    worker: function(path, opts, cb) {
      return loadFile(root, options.dirs.workers, path, 'js', opts, function(output) {
        if (opts.compress) output = minifyJSFile(output, path);
        return cb(output);
      });
    },
    css: function(path, opts, cb) {
      return loadFile(root, options.dirs.css, path, 'css', opts, cb);
    },
    html: function(path, opts, cb) {
      return loadFile(root, options.dirs.views, path, 'html', opts, cb);
    }
  };
};

exports.wrapModule = wrapModule = function(modPath, code) {
  return "require.define(\"" + modPath + "\", function (require, module, exports, __dirname, __filename){\n" + code + "\n});";
};

loadFile = function(root, dir, fileName, type, options, cb) {
  var extension, formatter, path;
  dir = pathlib.join(root, dir);
  path = pathlib.join(dir, fileName);
  extension = pathlib.extname(path);
  extension = extension && extension.substring(1);
  formatter = formatters.byExtension[extension];
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

formatKb = function(size) {
  return "" + (Math.round((size / 1024) * 1000) / 1000) + " KB";
};

minifyJSFile = function(originalCode, fileName) {
  var minifiedCode;
  minifiedCode = minifyJS(originalCode);
  log(("  Minified " + fileName + " from " + (formatKb(originalCode.length)) + " to " + (formatKb(minifiedCode.length))).grey);
  return minifiedCode;
};

minifyJS = function(originalCode) {
  var ast, jsp, pro;
  jsp = uglifyjs.parser;
  pro = uglifyjs.uglify;
  ast = jsp.parse(originalCode);
  ast = pro.ast_mangle(ast);
  ast = pro.ast_squeeze(ast);
  return pro.gen_code(ast);
};

wrapCode = function(code, path, pathPrefix) {
  var modPath, pathAry, sp;
  pathAry = path.split('/');
  if (__indexOf.call(pathAry, 'libs') >= 0) return code;
  if (__indexOf.call(pathAry, 'system') >= 0) {
    modPath = pathAry[pathAry.length - 1];
    return wrapModule(modPath, code);
  } else {
    modPath = pathAry.slice(1).join('/');
    if (pathPrefix) {
      if (pathPrefix.indexOf('.') > 0) {
        sp = pathPrefix.split('/');
        sp.pop();
        pathPrefix = sp.join('/');
      }
      modPath = path.substr(pathPrefix.length + 1);
    }
    return wrapModule('/' + modPath, code);
  }
};
