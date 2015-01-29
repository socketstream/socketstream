var traceur = require('traceur');
var ParseTreeTransformer = traceur.get('codegeneration/ParseTreeTransformer.js').ParseTreeTransformer;
var parseStatements = traceur.get('codegeneration/PlaceholderParser.js').parseStatements;
var parseStatement = traceur.get('codegeneration/PlaceholderParser.js').parseStatement;
var Script = traceur.get('syntax/trees/ParseTrees.js').Script;

// wraps global scripts
function GlobalTransformer(name, deps, exportName, init) {
  this.name = name;
  this.deps = deps;
  this.exportName = exportName;
  this.varGlobals = [];
  this.init = init;
  this.inOuterScope = true;
  return ParseTreeTransformer.call(this);
}

GlobalTransformer.prototype = Object.create(ParseTreeTransformer.prototype);

GlobalTransformer.prototype.transformVariableDeclarationList = function(tree) {
  this.isVarDeclaration = tree.declarationType == 'var';
  return ParseTreeTransformer.prototype.transformVariableDeclarationList.call(this, tree);
}

GlobalTransformer.prototype.transformVariableDeclaration = function(tree) {
  tree = ParseTreeTransformer.prototype.transformVariableDeclaration.call(this, tree);

  if (!this.inOuterScope || !this.isVarDeclaration)
    return tree;

  // do var replacement
  this.varGlobals.push(tree.lvalue.identifierToken.value);
  return tree;
}
GlobalTransformer.prototype.enterScope = function() {
  var revert = this.inOuterScope;
  this.inOuterScope = false;
  return revert;
}
GlobalTransformer.prototype.exitScope = function(revert) {
  if (revert)
    this.inOuterScope = true;
}

GlobalTransformer.prototype.transformFunctionDeclaration = function(tree) {
  var revert = this.enterScope();
  tree = ParseTreeTransformer.prototype.transformFunctionDeclaration.call(this, tree);
  this.exitScope(revert);
  return tree;
}

GlobalTransformer.prototype.transformFunctionExpression = function(tree) {
  var revert = this.enterScope();
  tree = ParseTreeTransformer.prototype.transformFunctionExpression.call(this, tree);
  this.exitScope(revert);
  return tree;
}

GlobalTransformer.prototype.transformScript = function(tree) {
  tree = ParseTreeTransformer.prototype.transformScript.call(this, tree);

  // for globals defined as "var x = 5;" in outer scope, add "this.x = x;" at end
  var scriptItemList = tree.scriptItemList.concat(this.varGlobals.map(function(g) {
    return parseStatement(['this["' + g + '"] = ' + g + ';']);
  }));

  return new Script(tree.location, parseStatements([
    'System.register("' + this.name + '", ' + JSON.stringify(this.deps) + ', false, function(__require, __exports, __module) {\n'
  + '  System.get("@@global-helpers").prepareGlobal(__module.id, ' + JSON.stringify(this.deps) + ');\n'
  + '  (function() {',
    '  }).call(System.global);'
  + '  return System.get("@@global-helpers").retrieveGlobal(__module.id, ' + (this.exportName ? '"' + this.exportName + '"' : 'false') + (this.init ? ', ' + this.init.toString().replace(/\n/g, '\n      ') : '') + ');\n'
  + '});'], scriptItemList));
}

exports.compile = function(load, opts, loader) {
  var options = { script: true };

  if (opts.sourceMaps)
    options.sourceMaps = 'memory';
  if (opts.lowResolutionSourceMaps)
    options.lowResolutionSourceMap = true;

  if (load.metadata.sourceMap)
    options.inputSourceMap = load.metadata.sourceMap;

  var compiler = new traceur.Compiler(options);
  var tree = compiler.parse(load.source, load.address);

  var deps = opts.normalize ? load.metadata.deps.map(function(dep) { return load.depMap[dep]; }) : load.metadata.deps;

  var transformer = new GlobalTransformer(load.name, deps, load.metadata.exports, load.metadata.init);
  tree = transformer.transformAny(tree);

  var output = compiler.write(tree, load.address);

  return Promise.resolve({
    source: output,
    sourceMap: compiler.getSourceMap()
  });
};


exports.sfx = function(loader) {

  return '(function() {\n'
  + '  var loader = System;\n'
  + '  var hasOwnProperty = loader.global.hasOwnProperty;\n'
  + '  var moduleGlobals = {};\n'
  + '  var curGlobalObj;\n'
  + '  var ignoredGlobalProps;\n'
  + '  if (typeof indexOf == \'undefined\')\n'
  + '    indexOf = Array.prototype.indexOf;\n'
  + '  System.set("@@global-helpers", System.newModule({\n'
  + '    prepareGlobal: function(moduleName, deps) {\n'
  + '      for (var i = 0; i < deps.length; i++) {\n'
  + '        var moduleGlobal = moduleGlobals[deps[i]];\n'
  + '        if (moduleGlobal)\n'
  + '          for (var m in moduleGlobal)\n'
  + '            loader.global[m] = moduleGlobal[m];\n'
  + '      }\n'
  + '      curGlobalObj = {};\n'
  + '      ignoredGlobalProps = ["indexedDB", "sessionStorage", "localStorage", "clipboardData", "frames", "webkitStorageInfo"];\n'
  + '      for (var g in loader.global) {\n'
  + '        if (indexOf.call(ignoredGlobalProps, g) != -1) { continue; }\n'
  + '        if (!hasOwnProperty || loader.global.hasOwnProperty(g)) {\n'
  + '          try {\n'
  + '            curGlobalObj[g] = loader.global[g];\n'
  + '          } catch (e) {\n'
  + '            ignoredGlobalProps.push(g);\n'
  + '          }\n'
  + '        }\n'
  + '      }\n'
  + '    },\n'
  + '    retrieveGlobal: function(moduleName, exportName, init) {\n'
  + '      var singleGlobal;\n'
  + '      var multipleExports;\n'
  + '      var exports = {};\n'
  + '      if (init) {\n'
  + '        var depModules = [];\n'
  + '        for (var i = 0; i < deps.length; i++)\n'
  + '          depModules.push(require(deps[i]));\n'
  + '        singleGlobal = init.apply(loader.global, depModules);\n'
  + '      }\n'
  + '      else if (exportName) {\n'
  + '        var firstPart = exportName.split(".")[0];\n'
  + '        singleGlobal = eval.call(loader.global, exportName);\n'
  + '        exports[firstPart] = loader.global[firstPart];\n'
  + '      }\n'
  + '      else {\n'
  + '        for (var g in loader.global) {\n'
  + '          if (indexOf.call(ignoredGlobalProps, g) != -1)\n'
  + '            continue;\n'
  + '          if ((!hasOwnProperty || loader.global.hasOwnProperty(g)) && g != loader.global && curGlobalObj[g] != loader.global[g]) {\n'
  + '            exports[g] = loader.global[g];\n'
  + '            if (singleGlobal) {\n'
  + '              if (singleGlobal !== loader.global[g])\n'
  + '                multipleExports = true;\n'
  + '            }\n'
  + '            else if (singleGlobal !== false) {\n'
  + '              singleGlobal = loader.global[g];\n'
  + '            }\n'
  + '          }\n'
  + '        }\n'
  + '      }\n'
  + '      moduleGlobals[moduleName] = exports;\n'
  + '      return multipleExports ? exports : singleGlobal;\n'
  + '    }\n'
  + '  }));\n'
  + '})();\n'
}
