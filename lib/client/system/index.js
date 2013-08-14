'use strict';

// System Assets
// -------------
// Loads system libraries and modules for the client. Also exposes an internal API 
// which other modules can use to send system assets to the client

var minifyJS, send;

var fs        = require('fs');
var pathlib   = require('path');
var uglifyjs  = require('uglify-js');

if (process.env.SS_DEV) {
    var coffee = require('coffee-script');
}

var wrap    = require('../wrap');

var fsUtils = require('../../utils/file');

// Allow internal modules to deliver assets to the browser
var assets  = {
    libs      : [],
    modules   : {},
    initCode  : []
};

// API to add new System Library or Module
exports.send = send = function(type, name, content, options) {
    // Set options to empty object if not passed
    if (options === null) {
        options = {};
    }

    if (coffee && options.coffee) {
        content = coffee.compile(content);
    }

    switch (type) {
    case 'code':
        return assets.initCode.push(content);
    case 'lib':
    case 'library':
        return assets.libs.push({
            name    : name,
            content : content,
            options : options
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
    var modDir = pathlib.join(__dirname, '/modules');
    return fsUtils.readDirSync(modDir).files.forEach(function(fileName) {
        var code = fs.readFileSync(fileName, 'utf8');
        var sp = fileName.split('.');
        var extension = sp[sp.length - 1];
        var modName = fileName.substr(modDir.length + 1);
        return send('mod', modName, code, {
            coffee: extension === 'coffee'
        });
    });
};


// Serve system assets
exports.serve = {
    js: function(options) {
        var name;

        // Set options to empty object if not passed    
        if (options === null) {
            options = {};
        }

        // Libs
        var output = assets.libs.map(function(code) {
            return options.compress && !code.options.minified && minifyJS(code.content) || code.content;
        });

        // Modules
        var _ref = assets.modules;
        for (name in _ref) {
            var mod = _ref[name];
            var code = wrap.module(name, mod.content);
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
