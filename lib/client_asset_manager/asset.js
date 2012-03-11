var fs, loadFile, log, minifyJS, pathlib, uglifyjs, wrapCode, wrapModule;

log = console.log;

fs = require('fs');

uglifyjs = require('uglify-js');

pathlib = require('path');

exports.init = function(root, formatters) {
  return {
    js: function(path, options, cb) {
      var fullPath;
      fullPath = pathlib.join(root, 'client/code', path);
      return loadFile(fullPath, formatters, options, function(output) {
        var basename;
        if (options.raw === true) return cb(output);
        output = wrapCode(output, path, options.pathPrefix);
        if (options && options.compress) {
          basename = pathlib.basename(path);
          if (!(basename.indexOf('.min') > 0)) output = minifyJS(basename, output);
        }
        return cb(output);
      });
    },
    css: function(path, options, cb) {
      var fullPath;
      fullPath = pathlib.join(root, 'client/css', path);
      return loadFile(fullPath, formatters, options, cb);
    }
  };
};

loadFile = function(path, formatters, options, cb) {
  var extension, formatter;
  extension = pathlib.extname(path);
  extension = extension && extension.substring(1);
  formatter = formatters[extension];
  if (!formatter) {
    throw new Error("Unsupported file extension '." + extension + "'. Please provide a formatter for " + path + " or remove it from your project");
  }
  return formatter.compile(path, options, cb);
};

minifyJS = function(file_name, orig_code) {
  var ast, formatKb, jsp, min_size, minified, orig_size, pro;
  formatKb = function(size) {
    return "" + (Math.round(size * 1000) / 1000) + " KB";
  };
  orig_size = orig_code.length / 1024;
  jsp = uglifyjs.parser;
  pro = uglifyjs.uglify;
  ast = jsp.parse(orig_code);
  ast = pro.ast_squeeze(ast);
  minified = pro.gen_code(ast);
  min_size = minified.length / 1024;
  log(("  Minified " + file_name + " from " + (formatKb(orig_size)) + " to " + (formatKb(min_size))).grey);
  return minified;
};

wrapCode = function(code, path, pathPrefix) {
  var dirName, modPath, pathAry;
  pathAry = path.split('/');
  dirName = pathAry[pathAry.length - 2];
  switch (dirName) {
    case 'libs':
      return code;
    case 'system':
      modPath = pathAry[pathAry.length - 1];
      return wrapModule(modPath, code);
    default:
      modPath = pathAry.slice(1).join('/');
      if (pathPrefix) modPath = path.substr(pathPrefix.length + 1);
      return wrapModule('/' + modPath, code);
  }
};

wrapModule = function(modPath, code) {
  return "require.define(\"" + modPath + "\", function (require, module, exports, __dirname, __filename){\n" + code + "\n});";
};
