// Client-Side Bundler of assets in development and production
'use strict';

var fs = require('fs'),
    path = require('path'),
    log = require('../../utils/log'),
    cleanCSS = require('clean-css'),
    system = require('../system'),
    view = require('../view'),
    wrap = require('../wrap'),
    magicPath = require('../magic_path'),
    uglifyjs = require('uglify-js'),
    jsp = uglifyjs.parser,
    pro = uglifyjs.uglify;

/**
 * Bundler by client name
 * @type {{}}
 */
var bundlers = {};

/**
 * Define the bundler for a client
 * @param client object to store the definition in
 * @param args arguments passed to define
 */
exports.define = function defineBundler(ss,client,args,options) {

  var name = args[0],
      pathsOrFunc = args[1];

  if (typeof pathsOrFunc === "function") {
    bundlers[name] = pathsOrFunc(ss,options);
    bundlers[name].dests = bundlers[name].define(client, args[2], args[3], args[4], args[5]);
  } else {
    bundlers[name] = require('./default')(ss,client,options);
    bundlers[name].dests = bundlers[name].define(args[1]);
  }
};

/**
 * Determine the bundler for a client
 * @param client Query params with client=name or an actual client object
 */
function getBundler(ss,client,options){

  if (client.bundler) { return client.bundler; }

  if (typeof client.client === "string") {
    return bundlers[client.client];
  }
  if (typeof client.name === "string") {
    return bundlers[client.name];
  }

  throw new Error('Unknow client '+(client.name || client.client) );
}

exports.get = getBundler;

exports.load = function() {
  for(var n in bundlers) {
    bundlers[n].load();
  }
};

exports.pack = function pack(ss, client, options) {
  client.pack = true;

  // the concrete bundler for the client
  var bundler = getBundler(ss, client, options);

  /* PACKER */

  log(('Pre-packing and minifying the \'' + client.name + '\' client...').yellow);
  
  // Prepare folder
  mkdir(bundler.dests.containerDir);
  mkdir(bundler.dests.dir);
  if (!(options.packedAssets && options.packedAssets.keepOldFiles)) {
    deleteOldFiles(bundler.dests.dir);
  }

  // Output CSS  
  bundler.pack.css(function(files) {
    var minified, original;
    original = files.join('\n');
    minified = cleanCSS.process(original);
    log.info(('  Minified CSS from ' + (exports.formatKb(original.length)) + ' to ' + (exports.formatKb(minified.length))).grey);
    return minified;
  });

  // Output JS  
  bundler.pack.js(function(files) {
    var parts = [];
    if (client.includes.system) {
      parts.push( system.serve.js({ compress:true }) );
    }
    parts = parts.concat(files);
    if (client.includes.initCode) {
      parts.push( system.serve.initCode() );
    }

    return parts.join(";");
  });

  // Output HTML view  
  return view(ss, client, options, function(html) {
    fs.writeFileSync(bundler.dests.paths.html, html);
    return log.info('✓'.green, 'Created and cached HTML file ' + bundler.dests.relPaths.html);
  });
};


function deleteOldFiles(clientDir) {
  var numFilesDeleted = 0,
      filesDeleted = fs.readdirSync(clientDir).map(function(fileName) {
        return fs.unlinkSync(path.join(clientDir, fileName));
      });
  return filesDeleted.length > 1 && log('✓'.green, '' + filesDeleted.length + ' previous packaged files deleted');
}

function mkdir(dir) {
  if (!fs.existsSync(dir)) {
    return fs.mkdirSync(dir);
  }
}

// API for implementing bundlers

exports.loadFile = function loadFile(ss, dir, fileName, type, options, cb) {
  dir = path.join(ss.root, dir);
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
  return formatter.compile(p.replace(/\\/g, '/'), options, cb);
};

exports.minifyJSFile = function minifyJSFile(originalCode, fileName) {
  var ast = jsp.parse(originalCode);
  ast = pro.ast_mangle(ast);
  ast = pro.ast_squeeze(ast);
  var minifiedCode = pro.gen_code(ast);
  log.info(('  Minified ' + fileName + ' from ' + (exports.formatKb(originalCode.length)) + ' to ' + (exports.formatKb(minifiedCode.length))).grey);
  return minifiedCode;
};

// input is decorated and returned
exports.sourcePaths = function(ss,paths,options) {

  function entries(from, dirType) {
    if (from == null) {
      return [];
    }
    var list = (from instanceof Array)? from : [from];

    return list.map(function(value) {
      var relClient = './' + path.relative(options.dirs.client, options.dirs[dirType]);
      return value.substring(0,2) === './'? value : path.join(relClient, value);
    });
  }

  paths.css = entries(paths.css, 'css');
  paths.code = entries(paths.code, 'code');
  paths.tmpl = entries(paths.tmpl || paths.templates, 'templates');

  var relClient = './' + path.relative(options.dirs.client, options.dirs['views']);
  paths.view = paths.view.substring(0,2) === './'? paths.view : path.join(relClient, paths.view);

  return paths;
};

exports.destsFor = function(ss,client,options) {
  var containerDir = path.join(ss.root, options.dirs.assets);
  var clientDir = path.join(containerDir, client.name);

  return {

    //TODO perhaps mixin the abs versions by SS
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
}

exports.packAssetSet = function packAssetSet(assetType, dir, client, bundler, postProcess) {
  var filePaths,
    prefix,
    paths = client.paths[assetType];

  function writeFile(fileContents) {
    var fileName = bundler.dests.paths[assetType];
    fs.writeFileSync(fileName, postProcess(fileContents));
    return log.info('✓'.green, 'Packed', filePaths.length, 'files into', bundler.dests.relPaths[assetType]);
  }

  function processFiles(fileContents, i) {
    var file, path, _ref;
    if (!fileContents) {
      fileContents = [];
    }
    if (!i) {
      i = 0;
    }
    _ref = filePaths[i], path = _ref.path, file = _ref.file;
    return bundler.asset[assetType](file, {
      pathPrefix: path,
      compress: true
    }, function(output) {
      fileContents.push(output);
      if (filePaths[++i]) {
        return processFiles(fileContents, i);
      } else {
        return writeFile(fileContents);
      }
    });
  }

  // Expand any dirs into real files
  if (paths && paths.length > 0) {
    filePaths = [];
    prefix = path.join(ss.root, dir);
    paths.forEach(function(path) {
      return magicPath.files(prefix, path).forEach(function(file) {
        return filePaths.push({
          path: path,
          file: file
        });
      });
    });
    return processFiles();
  }
}


exports.formatKb = function formatKb(size) {
  return '' + (Math.round((size / 1024) * 1000) / 1000) + ' KB';
};

// Before client-side code is sent to the browser any file which is NOT a library (e.g. /client/code/libs)
// is wrapped in a module wrapper (to keep vars local and allow you to require() one file in another).
// The 'system' directory is a special case - any module placed in this dir will not have a leading slash
exports.wrapCode = function wrapCode(code, path, pathPrefix, options) {
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
    return wrap.module(pathAry[pathAry.length - 1], code);
  } else {

    // Otherwise treat as a regular module
    var modPath = options.globalModules? pathAry.join("/") : pathAry.slice(1).join('/');

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
    return wrap.module('/' + modPath, code);
  }
};
