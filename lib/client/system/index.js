'use strict';

// System Assets
// -------------
// Loads system libraries and modules for the client. Also exposes an internal API 
// which other modules can use to send system assets to the client
var assets, fs, fsUtils, minifyJS, pathlib, send, uglifyjs, wrap;

fs = require('fs');

pathlib = require('path');

uglifyjs = require('uglify-js');

wrap = require('../wrap');

fsUtils = require('../../utils/file');

// Allow internal modules to deliver assets to the browser
assets = {
  libs: [],
  modules: {},
  initCode: []
};

// API to add new System Library or Module
exports.send = send = function(type, name, content, options) {
  if (options === null || options === undefined) {
    options = {};
  }
  switch (type) {
    case 'code':
      return assets.initCode.push(content);
    case 'lib':
    case 'library':
      return assets.libs.push({
        name: name,
        content: content,
        options: options
      });
    case 'mod':
    case 'module':
      if (assets.modules[name]) {
        throw new Error('System module name \'' + name + '\' already exists');
      } else {
        return assets.modules[name] = {
          content: content,
          options: options
        };
      }
  }
};

// Load all system libs and modules
exports.load = function() {
  var modDir;

  // Load essential libs for backwards compatibility with all browsers
  // and to enable module loading. Note with libs, order is important!  
  ['json.min.js', 'browserify.js'].forEach(function(fileName) {
    var code, path, preMinified;
    path = pathlib.join(__dirname, '/libs/' + fileName);
    code = fs.readFileSync(path, 'utf8');
    preMinified = fileName.indexOf('.min') >= 0;
    return send('lib', fileName, code, {
      minified: preMinified
    });
  });

  // System Modules. Including main SocketStream client code
  // Load order is not important  
  modDir = pathlib.join(__dirname, '/modules');
  return fsUtils.readDirSync(modDir).files.forEach(function(fileName) {
    var code, extension, modName, sp;
    code = fs.readFileSync(fileName, 'utf8');
    sp = fileName.split('.');
    extension = sp[sp.length - 1];
    modName = fileName.substr(modDir.length + 1);
    return send('mod', modName, code, {
      coffee: extension === 'coffee'
    });
  });
};

// Serve system assets
exports.serve = {
  js: function (options) {
    var code, mod, name, output, _ref;
    if (options === null || options === undefined) {
      options = {};
    }

    // Libs
    output = assets.libs.map(function(code) {
      return options.compress && !code.options.minified && minifyJS(code.content) || code.content;
    });

    // Modules    
    _ref = assets.modules;
    for (name in _ref) {
      mod = _ref[name];
      code = wrap.module(name, mod.content);
      if (options.compress && !mod.options.minified) {
        code = minifyJS(code);
      }
      output.push(code);
    }
    return output.join('\n');
  },
  initCode: function() {
    return assets.initCode.join(' ');
  }
};

// Private
minifyJS = function(originalCode) {
  var ast, jsp, pro;
  jsp = uglifyjs.parser;
  pro = uglifyjs.uglify;
  ast = jsp.parse(originalCode);
  ast = pro.ast_mangle(ast);
  ast = pro.ast_squeeze(ast);
  return pro.gen_code(ast) + ';';
};
