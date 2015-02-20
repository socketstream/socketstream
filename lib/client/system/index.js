'use strict';

// System Assets
// -------------
// Loads system libraries and modules for the client. Also exposes an internal API 
// which other modules can use to send system assets to the client

var fs = require('fs'),
    pathlib = require('path'),
    uglifyjs = require('uglify-js'),
    fsUtils = require('../../utils/file');

// Allow internal modules to deliver assets to the browser
var assets = exports.assets = {
  libs: [],
  modules: {},
  startCode: []
};

function pushUniqueAsset(listName,asset) {
  var list = assets[listName],i;
  for(i=list.length-1; i>=0; --i) {
    if (list[i].name === asset.name) {
      list.splice(i,1);
    }
  }
  return list.push(asset);
}

// API to add new System Library or Module
var send = exports.send = function (type, name, content, options) {
  if (options === null || options === undefined) {
    options = {};
  }

  switch (type) {
    case 'start':
    case 'code':
      return assets.startCode.push({content:content,options:options, type:'start'});
    case 'lib':
    case 'library':
      return pushUniqueAsset('libs',{
        name: name,
        type: type,
        dir: pathlib.join(__dirname,'libs'),
        path: pathlib.join(__dirname,'libs',name + '.js'),
        content: content,
        options: options
      });
    case 'mod':
    case 'module':
      if (assets.modules[name]) {
        throw new Error('System module name \'' + name + '\' already exists');
      } else {
        assets.modules[name] = {
          name: name,
          type: type,
          dir: pathlib.join(__dirname,'modules'),
          path: pathlib.join(__dirname,'modules',name + '.js'),
          content: content,
          options: options
        };
        return assets.modules[name];
      }
  }
};

exports.unload = function() {
  assets.libs = [];
  assets.modules = {};
  assets.startCode = [];
};

// Load all system libs and modules
exports.load = function() {
  var modDir;

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
    modName = fileName.substr(modDir.length + 1).replace('.js','').replace('.min.js','');
    return send('mod', modName, code, {
      coffee: extension === 'coffee'
    });
  });
};
