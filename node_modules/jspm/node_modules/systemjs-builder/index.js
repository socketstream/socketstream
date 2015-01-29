var Promise = require('rsvp').Promise;

var System = exports.System = require('systemjs');
var fs = require('fs');

var asp = require('rsvp').denodeify;

var es6Compiler = require('./compilers/es6');
var registerCompiler = require('./compilers/register');
var amdCompiler = require('./compilers/amd');
var cjsCompiler = require('./compilers/cjs');
var globalCompiler = require('./compilers/global');
var builder = require('./lib/builder');

var path = require('path');

// TODO source maps
var loader, pluginLoader;

function reset() {
  loader = new Loader(System);
  loader.baseURL = System.baseURL;
  loader.paths = { '*': '*.js' };
  loader.config = System.config;

  pluginLoader = new Loader(System);
  pluginLoader.baseURL = System.baseURL;
  pluginLoader.paths = { '*': '*.js' };
  pluginLoader.config = System.config;
  pluginLoader.trace = true;

  pluginLoader._nodeRequire = loader._nodeRequire = require;

  loader.trace = true;
  loader.execute = false;
  loader.pluginLoader = pluginLoader;

  loader.set('@empty', loader.newModule({}));

  amdCompiler.attach(loader);
  amdCompiler.attach(pluginLoader);
  exports.loader = loader;
}
exports.reset = reset;

reset();

exports.build = function(moduleName, outFile, opts) {
  opts = opts || {};
  return exports.trace(moduleName, opts.config)
  .then(function(trace) {
    return exports.buildTree(trace.tree, outFile, opts);
  });
};

function compileLoad(load, opts, compilers) {
  return Promise.resolve()
  .then(function() {
    // note which compilers we used
    compilers = compilers || {};
    if (load.metadata.build == false) {
      return {};
    }
    else if (load.metadata.format == 'es6') {
      compilers['es6'] = true;
      return es6Compiler.compile(load, opts, loader);
    }
    else if (load.metadata.format == 'register') {
      compilers['register'] = true;
      return registerCompiler.compile(load, opts, loader);
    }
    else if (load.metadata.format == 'amd') {
      compilers['amd'] = true;
      return amdCompiler.compile(load, opts, loader);
    }
    else if (load.metadata.format == 'cjs') {
      compilers['cjs'] = true;
      return cjsCompiler.compile(load, opts, loader);
    }
    else if (load.metadata.format == 'global') {
      compilers['global'] = true;
      return globalCompiler.compile(load, opts, loader);
    }
    else if (load.metadata.format == 'defined') {
      return {source: ''};
    }
    else {
      throw "unknown format " + load.metadata.format;
    }
  });
}

exports.buildTree = function(tree, outFile, opts) {
  opts = opts || {};
  opts.outFile = outFile;

  var outputs = ['"format register";\n'];
  var names = Object.keys(tree);

  return Promise.all(names.map(function(name) {
    var load = tree[name];
    return Promise.resolve(compileLoad(load, opts))
                  .then(outputs.push.bind(outputs));
  }))
  .then(builder.writeOutputFile.bind(this, opts, outputs));
};

exports.buildSFX = function(moduleName, outFile, opts) {
  opts = opts || {};
  var config = opts.config;

  opts.outFile = outFile;

  var outputs = [];
  var compilers = {};
  opts.normalize = true;
  return exports.trace(moduleName, config)
  .then(function(trace) {
    var tree = trace.tree;
    moduleName = trace.moduleName;
    return Promise.all(Object.keys(tree).map(function(name) {
      var load = tree[name];
      if (load.metadata.plugin && (load.metadata.build === false || load.metadata.plugin.build === false)) {
        outputs.push('System.register("' + load.name + '", [], false, function() { console.log("SystemJS Builder - Plugin for ' + load.name + ' does not support sfx builds"); });\n');
      }

      return Promise.resolve(compileLoad(load, opts, compilers))
                    .then(outputs.push.bind(outputs));
    }));
  })
  // next add sfx headers for formats at the beginning
  .then(function() {
    if (compilers.register && registerCompiler.sfx)
      return registerCompiler.sfx(loader);
  })
  .then(function(result) {
    outputs.unshift(result || '');
    if (compilers.amd && amdCompiler.sfx)
      return amdCompiler.sfx(loader);
  })
  .then(function(result) {
    outputs.unshift(result || '');
    if (compilers.cjs && cjsCompiler.sfx)
      return cjsCompiler.sfx(loader);
  })
  .then(function(result) {
    outputs.unshift(result || '');
    if (compilers.global && globalCompiler.sfx)
      return globalCompiler.sfx(loader);
  })
  // next wrap with the core code
  .then(function(result) {
    outputs.push(result || '');
    return asp(fs.readFile)(path.resolve(__dirname, './sfx/sfx-core.js'));
  })
  .then(function(sfxcore) {
    outputs.unshift("('" + moduleName + "', function(System) {\n");
    outputs.unshift(sfxcore.toString());
  })
  .then(function(result) {
    outputs.push("});");
  })
  .then(builder.writeOutputFile.bind(this, opts, outputs));
};

exports.loadConfig = function(configFile) {
  return Promise.resolve()
  .then(function() {
    return asp(fs.readFile)(path.resolve(process.cwd(), configFile))
  })
  .then(function(source) {
    var curSystem = global.System;
    global.System = {
      config: function(cfg) {
        loader.config(cfg);
        pluginLoader.config(cfg);
      }
    };
    new Function(source.toString()).call(global);
    global.System = curSystem;
  });
}

exports.config = function(config) {
  var cfg = {};
  for (var p in config) {
    if (p != 'bundles')
      cfg[p] = config[p];
  }
  loader.config(cfg);
  pluginLoader.config(cfg);
};

// returns a new tree containing tree1 n tree2
exports.intersectTrees = function(tree1, tree2) {
  var intersectTree = {};

  var tree1Names = [];
  for (var name in tree1)
    tree1Names.push(name);

  for (var name in tree2) {
    if (tree1Names.indexOf(name) == -1)
      continue;

    intersectTree[name] = tree1[name];
  }

  return intersectTree;
};

// returns a new tree containing tree1 + tree2
exports.addTrees = function(tree1, tree2) {
  var unionTree = {};

  for (var name in tree2)
    unionTree[name] = tree2[name];

  for (var name in tree1)
    unionTree[name] = tree1[name];

  return unionTree;
};

// returns a new tree containing tree1 - tree2
exports.subtractTrees = function(tree1, tree2) {
  var subtractTree = {};

  for (var name in tree1)
    subtractTree[name] = tree1[name];

  for (var name in tree2)
    delete subtractTree[name];

  return subtractTree;
};

// copies a subtree out of the tree
exports.extractTree = function(tree, moduleName) {
  var outTree = {};
  return visitTree(tree, moduleName, null, function(load) {
    outTree[load.name] = load;
  })
  .then(function() {
    return outTree;
  });
};

exports.trace = function(moduleName, config, includePlugins) {
  if (config) {
    exports.config(config);
  }

  var System = loader.global.System;
  loader.global.System = loader;

  var traceTree = {};

  return loader.import(moduleName)
  .then(function() {
    return loader.normalize(moduleName);
  })
  .then(function(_moduleName) {
    moduleName = _moduleName;
    loader.global.System = System;
    return visitTree(loader.loads, moduleName, includePlugins && loader.pluginLoader, function(load) {
      traceTree[load.name] = load;
    });
  })
  .then(function() {
    return {
      moduleName: moduleName,
      tree: traceTree
    };
  })
  .catch(function(e) {
    loader.global.System = System;
    throw e;
  });
}

function visitTree(tree, moduleName, pluginLoader, visit, seen) {
  seen = seen || [];

  if (seen.indexOf(moduleName) != -1)
    return;

  seen.push(moduleName);

  var load = tree[moduleName];

  if (!load)
    return Promise.resolve()

  // visit the deps first
  return Promise.all(load.deps.map(function(dep) {
    return visitTree(tree, load.depMap[dep], pluginLoader, visit, seen);
  })).then(function() {
    if (!pluginLoader)
      return;

    var pluginName = load.metadata.pluginName;
    if (pluginName) {
      return visitTree(pluginLoader.loads, pluginName, pluginLoader, visit, seen);
    }
  })
  .then(function() {
    // if we are the bottom of the tree, visit
    return visit(load);
  });
}
