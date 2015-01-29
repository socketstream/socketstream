var System = require('systemjs');
var traceur = require('traceur');

var ScopeTransformer = traceur.get('codegeneration/ScopeTransformer.js').ScopeTransformer;
var parseExpression = traceur.get('codegeneration/PlaceholderParser.js').parseExpression;

var CJSRequireTransformer = require('./cjs').CJSRequireTransformer;

// First of two-pass transform
// lists number of define statements, the named module it defines (if any), and deps
// second pass will do rewriting based on this info
// we set this.isAnon, which is true if there is one named define, or one anonymous define
// if there are more than one anonymous defines, it is invalid
function AMDDependenciesTransformer(map) {
  // optional mapping function
  this.map = map;
  this.anonDefine = false;
  this.defineBundle = false;
  this.deps = [];
  return ScopeTransformer.call(this, 'define');
}
AMDDependenciesTransformer.prototype = Object.create(ScopeTransformer.prototype);
AMDDependenciesTransformer.prototype.filterAMDDeps = function(deps) {
  var newDeps = [];
  deps.forEach(function(dep) {
    if (['require', 'exports', 'module'].indexOf(dep) != -1)
      return;
    newDeps.push(dep);
  });
  return newDeps;
}
AMDDependenciesTransformer.prototype.transformCallExpression = function(tree) {
  if (!tree.operand.identifierToken || tree.operand.identifierToken.value != 'define')
    return ScopeTransformer.prototype.transformCallExpression.call(this, tree);

  var args = tree.args.args;
  var name = args[0].type === 'LITERAL_EXPRESSION' && args[0].literalToken.processedValue;

  // anonymous define
  if (!name) {
    // already defined anonymously -> throw
    if (this.anonDefine)
      throw "Multiple defines for anonymous module";
    this.anonDefine = true;
  }
  // named define
  else {
    // if we don't have any other defines,
    // then let this be an anonymous define
    if (!this.anonDefine && !this.defineBundle)
      this.anonDefine = true;

    // otherwise its a bundle only
    else {
      this.anonDefine = false;
      this.deps = [];
    }

    // the above is just to support single modules of the form:
    // define('jquery')
    // still loading anonymously
    // because it is done widely enough to be useful

    // note this is now a bundle
    this.defineBundle = true;
  }

  // only continue to extracting dependencies if we're anonymous
  if (!this.anonDefine)
    return tree;

  var depTree;

  if (args[0].type === 'ARRAY_LITERAL_EXPRESSION')
    depTree = args[0];
  else if (args[1] && args[1].type == 'ARRAY_LITERAL_EXPRESSION')
    depTree = args[1];

  if (depTree) {
    // apply the map to the tree
    if (this.map)
      depTree.elements = depTree.elements.map(this.map);
    this.deps = this.filterAMDDeps(depTree.elements.map(function(dep) {
      return dep.literalToken.processedValue;
    }));
    return tree;
  }

  var cjsFactory;

  if (args[0].type == 'FUNCTION_EXPRESSION')
    cjsFactory = args[0];
  else if (args[0].type == 'LITERAL_EXPRESSION' && args[1] && args[1].type == 'FUNCTION_EXPRESSION')
    cjsFactory = args[1];
  else if (args[0].type == 'IDENTIFIER_EXPRESSION')
    this.globalCJSRequires = true;

  if (cjsFactory) {
    // now we need to do a scope transformer for the require function at this position
    var fnParameters = cjsFactory.parameterList.parameters;
    var reqName = fnParameters[0] && fnParameters[0].parameter.binding.identifierToken.value;

    // now we create a new scope transformer and apply it to this function to find every call of
    // the function reqName, noting the require
    var cjsRequires = new CJSRequireTransformer(reqName);
    cjsFactory.body = cjsRequires.transformAny(cjsFactory.body);
    this.deps = this.filterAMDDeps(cjsRequires.requires);
  }

  return tree;
}

// AMD System.register transpiler
// This is the second of the two pass transform
function AMDDefineRegisterTransformer(load, isAnon, depMap) {
  this.load = load;
  this.isAnon = isAnon;
  this.depMap = depMap;
  return ScopeTransformer.call(this, 'define');
}
AMDDefineRegisterTransformer.prototype = Object.create(ScopeTransformer.prototype);
AMDDefineRegisterTransformer.prototype.transformCallExpression = function(tree) {
  if (!tree.operand.identifierToken || tree.operand.identifierToken.value != 'define')
    return ScopeTransformer.prototype.transformCallExpression.call(this, tree);

  var self = this;
  var args = tree.args.args;

  // check for named modules
  if (args[0].type === 'LITERAL_EXPRESSION') {
    if (!this.isAnon)
      name = args[0].literalToken.processedValue;
    args = args.splice(1);
  }

  if (!args[0])
    return;

  // only when "exports" is present as an argument
  // or dependency, does it become "this" for AMD
  // otherwise "this" must reference the global
  var bindToExports = false;
  /*
    define(['some', 'deps', 'require'], function(some, deps, require) {

    });

    ->

    System.register(['some', 'deps', 'require'], false, function(__require, __exports, __module) {
      return (function(some, deps, require) {

      })(__require('some'), __require('deps'), __require);
    });

    define(['dep'], factory)

    ->

    System.register(['dep'], false, function(__require, __exports, __module) {
      return (factory)(__require('dep'));
    });


    define('jquery', [], factory)

    ->

    System.register([], false, factory);

    IF it is the only define

    otherwise we convert an AMD bundle into a register bundle:

    System.register('jquery', [], false, factory);

    Note that when __module is imported, we decorate it with 'uri' and an empty 'config' function
  */
  if (args[0].type === 'ARRAY_LITERAL_EXPRESSION') {

    var name = this.load.name;
    var deps = args[0];
    var factory = args[1];

    // convert into strings
    deps = deps.elements.map(function(dep) {
      var depValue = dep.literalToken.processedValue;
      return self.depMap[depValue] || depValue;
    });

    if (deps.length != 0) {
      // filter out the special deps "require", "exports", "module"
      var requireIndex, exportsIndex, moduleIndex;

      var depNames = deps.map(function(dep) {
        return self.depMap[dep] || dep;
      });

      var depCalls = depNames.map(function(depName) {
        return "__require('" + depName + "')";
      });

      requireIndex = depNames.indexOf('require');
      exportsIndex = depNames.indexOf('exports');
      moduleIndex = depNames.indexOf('module');

      var exportsIndexD = exportsIndex, moduleIndexD = moduleIndex;

      if (requireIndex != -1) {
        if (factory.parameterList) {
          var fnParameters = factory.parameterList.parameters;
          var reqName = fnParameters[requireIndex] && fnParameters[requireIndex].parameter.binding.identifierToken.value;
        }
        var cjsRequireTransformer = new CJSRequireTransformer(reqName, function(v) { return self.depMap[v] || v });
        factory.body = cjsRequireTransformer.transformAny(factory.body);

        depCalls.splice(requireIndex, 1, '__require');
        deps.splice(requireIndex, 1);
        if (exportsIndex > requireIndex)
          exportsIndexD--;
        if (moduleIndex > requireIndex)
          moduleIndexD--;
      }
      if (exportsIndex != -1) {
        bindToExports = true;
        depCalls.splice(exportsIndex, 1, '__exports');
        deps.splice(exportsIndexD, 1);
        if (moduleIndexD > exportsIndexD)
          moduleIndexD--;
      }
      if (moduleIndex != -1) {
        depCalls.splice(moduleIndex, 1, '__module');
        deps.splice(moduleIndexD, 1);
      }
    }

    if (depCalls)
      return parseExpression([
        'System.register("' + name + '",',
        ', false, function(__require, __exports, __module) {\n  return (',
        ').call(' + (bindToExports ? '__exports' : 'this') + ', ',
        ');\n});'
      ], parseExpression([JSON.stringify(deps)]), factory, parseExpression([depCalls.join(', ')]));
    else
      return parseExpression([
        'System.register("' + name + '",',
        ', false, function(__require, __exports, __module) {\n  return (',
        ').call(' + (bindToExports ? '__exports' : 'this') + ');\n});'
      ], parseExpression([JSON.stringify(deps)]), factory);
  }



  /*
    define({ })

    ->

    System.register([], false, function() {
      return { };
    });
  */
  if (args[0].type == 'OBJECT_LITERAL_EXPRESSION') {
    return parseExpression([
      'System.register("' + this.load.name + '", [], false, function() {\n  return ',
      ';\n});'
    ], args[0]);
  }

  /*
    define(function(require, exports, module) {
      require('some-dep');
    });

    ->

    System.register(['some-dep'], false, function(require, exports, module) {
      require('some-dep');
    });

    Note there is a strange subtlety in RequireJS here.

    If there is one argument,
  */
  if (args[0].type == 'FUNCTION_EXPRESSION') {
    // system loader already extracted the deps for us
    var requires = this.load.deps.map(function(dep) {
      return self.depMap[dep] || dep;
    });

    var params = args[0].parameterList.parameters;
    if (params.length > 1)
      bindToExports = true;

    var reqName = params[0] && params[0].parameter.binding.identifierToken.value;
    // NB it may be useful to use the scoped version of the require transformer here in case of minified code.
    var cjsRequireTransformer = new CJSRequireTransformer(reqName, function(v) { return self.depMap[v] || v });
    args[0].body = cjsRequireTransformer.transformAny(args[0].body);

    var params = args[0].parameterList.parameters;
    if (params.length > 1)
      bindToExports = true;

    if (bindToExports)
      return parseExpression([
        'System.register("' + this.load.name + '", ' + JSON.stringify(requires) + ', false, function(__require, __exports, __module) {\n'
      + 'return (',
        ').call(__exports, __require, __exports, __module);\n'
      + '});'
      ], args[0]);
    else
      return parseExpression([
        'System.register("' + this.load.name + '", ' + JSON.stringify(requires) + ', false, ',
        ');'
      ], args[0]);
  }

  /*
    define(factory);

  ->

    System.register([], false, typeof factory == 'function' ? factory : function() { return factory; })

   */
  if (args[0].type == 'IDENTIFIER_EXPRESSION') {
    var requires = this.load.deps.map(function(dep) {
      return self.depMap[dep] || dep;
    });
    var token = args[0].identifierToken.value;
    return parseExpression([
      'System.register("' + this.load.name + '", ' + JSON.stringify(requires) + ', false, ' +
            'typeof ' + token + ' == "function" ? ' + token + ' : function() { return ' + token + '; });'
    ]);
  }

  return ScopeTransformer.prototype.transformCallExpression.call(this, tree);
}

// override System instantiate to handle AMD dependencies
exports.attach = function(loader) {
  var systemInstantiate = loader.instantiate;
  loader.instantiate = function(load) {
    var result = systemInstantiate.call(this, load);

    if (load.metadata.format == 'amd') {
      // extract AMD dependencies using tree parsing
      // NB can remove after Traceur 0.0.77
      if (!load.source) load.source = ' ';
      var compiler = new traceur.Compiler({ script: true });
      load.metadata.parseTree = compiler.parse(load.source, load.address);
      var depTransformer = new AMDDependenciesTransformer();
      depTransformer.transformAny(load.metadata.parseTree);

      // we store the results as meta
      load.metadata.isAnon = depTransformer.anonDefine;
      load.metadata.globalCJSRequires = depTransformer.globalCJSRequires;

      if (depTransformer.globalCJSRequires) {
        var cjsRequires = new CJSRequireTransformer('require');
        cjsRequires.transformAny(load.metadata.parseTree);
        depTransformer.deps = depTransformer.filterAMDDeps(cjsRequires.requires);
      }

      return {
        deps: depTransformer.deps,
        execute: function() {}
      };
    }

    return result;
  };
};

exports.remap = function(source, map, fileName) {
  // NB can remove after Traceur 0.0.77
  if (!source) source = ' ';
  var options = {script: true};
  var compiler = new traceur.Compiler(options);
  var tree = compiler.parse(source, fileName || '');
  var transformer = new AMDDependenciesTransformer(map);
  tree = transformer.transformAny(tree);

  if (transformer.globalCJSRequires) {
    var cjsRequires = new CJSRequireTransformer('require', function(v) { return map[v] || v; });
    tree = cjsRequires.transformAny(tree);
  }

  var output = compiler.write(tree);
  return Promise.resolve(output);
};


// converts anonymous AMDs into named AMD for the module
exports.compile = function(load, opts, loader) {
  var normalize = opts.normalize;
  var options = {};
  if (opts.sourceMaps)
    options.sourceMaps = 'memory';
  if (opts.lowResolutionSourceMaps)
    options.lowResolutionSourceMap = true;

  if (load.metadata.sourceMap)
    options.inputSourceMap = load.metadata.sourceMap;

  var compiler = new traceur.Compiler(options);

  var tree = load.metadata.parseTree;
  var transformer = new AMDDefineRegisterTransformer(load, load.metadata.isAnon, normalize ? load.depMap : {});
  tree = transformer.transformAny(tree);

  if (load.metadata.globalCJSRequires) {
    var cjsRequires = new CJSRequireTransformer('require', normalize && function(v) { return load.depMap[v] || v; });
    tree = cjsRequires.transformAny(tree);
  }

  var output = compiler.write(tree, load.address);

  // because we've blindly replaced the define statement from AMD with a System.register call
  // we have to ensure we still trigger any AMD guard statements in the code by creating a dummy define which isn't called
  return Promise.resolve({
    source: '(function() {\nfunction define(){};  define.amd = {};\n' + output + '})();',
    sourceMap: compiler.getSourceMap(),
    sourceMapOffset: 2
  });
};
