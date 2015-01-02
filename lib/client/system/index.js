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
  shims: [],
  libs: [],
  modules: {},
  initCode: []
};

function pushUniqueAsset(listName,asset) {
  var list = assets[listName];
  for(var i=list.length-1; i>=0; --i) {
    if (list[i].name === asset.name) {
      list.splice(i,1);
    }
  }
  return list.push(asset);
}

// API to add new System Library or Module
exports.send = send = function(type, name, content, options) {
  if (options === null || options === undefined) {
    options = {};
  }
  switch (type) {
    case 'code':
      return assets.initCode.push(content);
    case 'shim':
      return pushUniqueAsset('shims',{
        name: name,
        content: content,
        options: options
      });
    case 'lib':
    case 'library':
      return pushUniqueAsset('libs',{
        name: name,
        content: content,
        options: options
      });
    case 'mod':
    case 'module':
      if (assets.modules[name]) {
        throw new Error('System module name \'' + name + '\' already exists');
      } else {
        assets.modules[name] = {
          content: content,
          options: options
        };
        return assets.modules[name];
      }
  }
};

exports.unload = function() {
  assets.shims = [];
  assets.libs = [];
  assets.modules = {};
  assets.initCode = [];
};

// Load all system libs and modules
exports.load = function() {
  var modDir;

  // System shims for backwards compatibility with all browsers.
  // Load order is not important  
  modDir = pathlib.join(__dirname, '/shims');
  fsUtils.readDirSync(modDir).files.forEach(function(fileName) {
    var code, extension, modName, sp, preMinified;
    code = fs.readFileSync(fileName, 'utf8');
    sp = fileName.split('.');
    extension = sp[sp.length - 1];
    preMinified = fileName.indexOf('.min') >= 0;
    modName = fileName.substr(modDir.length + 1);
    return send('shim', modName, code, {
      minified: preMinified,
      coffee: extension === 'coffee'
    });
  });

  // System Libs. Including browserify client code
  // Load order is not important  
  modDir = pathlib.join(__dirname, '/libs');
  fsUtils.readDirSync(modDir).files.forEach(function(fileName) {
    var code, extension, modName, sp;
    code = fs.readFileSync(fileName, 'utf8');
    sp = fileName.split('.');
    extension = sp[sp.length - 1];
    modName = fileName.substr(modDir.length + 1);
    return send('lib', modName, code, {
      coffee: extension === 'coffee'
    });
  });

  // System Modules. Including main SocketStream client code
  // Load order is not important  
  modDir = pathlib.join(__dirname, '/modules');
  fsUtils.readDirSync(modDir).files.forEach(function(fileName) {
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

    // Shims
    output = assets.shims.map(function(code) {
      return options.compress && !code.options.minified && minifyJS(code.content) || code.content;
    });

    // Libs
    output = output.concat(assets.libs.map(function(code) {
      return options.compress && !code.options.minified && minifyJS(code.content) || code.content;
    }));

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
