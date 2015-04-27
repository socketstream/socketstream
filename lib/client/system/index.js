'use strict';

// System Assets
// -------------
// Loads system libraries and modules for the client. Also exposes an internal API
// which other modules can use to send system assets to the client

var fs = require('fs'),
    pathlib = require('path'),
    fsUtils = require('../../utils/file');

// Allow internal modules to deliver assets to the browser
var assets = exports.assets = {
  libs: [],
  modules: {},
  constants: {},
  locals: {},
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

/**
 * @ngdoc function
 * @name ss.client:client#send
 * @methodOf ss.client:client
 * @param {'code','lib','module'} type - `code`, `lib`, `module`.
 * @param {string} name - Module name for require.
 * @param {string} content - The JS code
 * @param {Object} options - Allows you to specify `compress` and `coffee` format flags.
 * @description
 * Allow other libs to send assets to the client. add new System Library or Module
 */

var send = exports.send = function (type, name, content, options) {
  if (options === null || options === undefined) {
    options = {};
  }

  switch (type) {
    case 'const':
    case 'constant':
      return (assets.constants[name] = {value:content,name:name,type:'const',options:options});
    case 'local':
      return (assets.locals[name] = { value:content,name:name,type:type,options:options});
    case 'start':
    case 'code':
      return assets.startCode.push({content:content,options:options, type:'start'});
    case 'lib':
    case 'library':
      return pushUniqueAsset('libs',{
        name: name,
        type: 'lib',
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
        name = name.replace(/\.js$/,'');
        assets.modules[name] = {
          name: name,
          type: 'mod',
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
  assets.constants = {};
  assets.startCode = [];
};

// Load all system libs and modules
exports.load = function() {
  var modDir;

  // System Libs. Including browserify client code
  // Load order is not important
  /*
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
  */

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
