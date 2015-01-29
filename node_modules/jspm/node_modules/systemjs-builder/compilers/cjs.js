var path = require('path');
var traceur = require('traceur');
var ParseTreeTransformer = traceur.get('codegeneration/ParseTreeTransformer.js').ParseTreeTransformer;
var Script = traceur.get('syntax/trees/ParseTrees.js').Script;
var parseStatements = traceur.get('codegeneration/PlaceholderParser.js').parseStatements;

// remap require() statements
function CJSRequireTransformer(requireName, map) {
  this.requireName = requireName;
  this.map = map;
  this.requires = [];
  return ParseTreeTransformer.call(this);
}
CJSRequireTransformer.prototype = Object.create(ParseTreeTransformer.prototype);
CJSRequireTransformer.prototype.transformCallExpression = function(tree) {
  if (!tree.operand.identifierToken || tree.operand.identifierToken.value != this.requireName)
    return ParseTreeTransformer.prototype.transformCallExpression.call(this, tree);

  // found a require
  var args = tree.args.args;
  if (args.length && args[0].type == 'LITERAL_EXPRESSION') {
    if (this.map)
      args[0].literalToken.value = '"' + this.map(args[0].literalToken.processedValue) + '"';

    this.requires.push(args[0].literalToken.processedValue);
  }

  return ParseTreeTransformer.prototype.transformCallExpression.call(this, tree);
}
exports.CJSRequireTransformer = CJSRequireTransformer;


// convert CommonJS into System.registerDynamic
function CJSRegisterTransformer(name, deps, address, baseURL) {
  this.name = name;
  this.deps = deps;
  this.address = address;
  this.baseURL = baseURL;
  this.usesFilePaths = false;
  return ParseTreeTransformer.call(this);
}

CJSRegisterTransformer.prototype = Object.create(ParseTreeTransformer.prototype);
CJSRegisterTransformer.prototype.transformIdentifierExpression = function(tree) {
  var value = tree.identifierToken.value;
  if (!this.usesFilePaths && value == '__filename' || value == '__dirname')
    this.usesFilePaths = true;
  return ParseTreeTransformer.prototype.transformIdentifierExpression.call(this, tree);
}

CJSRegisterTransformer.prototype.transformScript = function(tree) {
  tree = ParseTreeTransformer.prototype.transformScript.call(this, tree);

  var scriptItemList = tree.scriptItemList;

  if (this.usesFilePaths) {
    var filename = path.relative(this.baseURL, this.address).replace(/\\/g, "/");
    var dirname = path.dirname(filename);

    scriptItemList = parseStatements(['var __filename = System.baseURL + "' + filename + '", __dirname = System.baseURL + "' + dirname + '"']).concat(scriptItemList);
  }

  scriptItemList = parseStatements([
    'var global = System.global, __define = global.define;\n'
    + 'global.define = undefined;'
  ]).concat(scriptItemList).concat(parseStatements([
    'global.define = __define;\n'
    +  'return module.exports;'
  ]));

  // wrap everything in System.register
  return new Script(tree.location, parseStatements([
    'System.register("' + this.name + '", ' + JSON.stringify(this.deps) + ', true, function(require, exports, module) {\n',
    '});'], scriptItemList));
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

  var transformer;

  if (opts.normalize) {
    transformer = new CJSRequireTransformer('require', function(dep) { return load.depMap[dep]; });
    tree = transformer.transformAny(tree);
  }

  var deps = opts.normalize ? load.metadata.deps.map(function(dep) { return load.depMap[dep]; }) : load.metadata.deps;

  transformer = new CJSRegisterTransformer(load.name, deps, load.address, loader.baseURL);
  tree = transformer.transformAny(tree);

  var output = compiler.write(tree, load.address);

  return Promise.resolve({
    source: output,
    sourceMap: compiler.getSourceMap()
  });
};

function remap(source, map, fileName) {
  var options = {script: true};
  var compiler = new traceur.Compiler(options);
  var tree = compiler.parse(source, fileName);

  var transformer = new CJSRequireTransformer('require', map);
  tree = transformer.transformAny(tree);

  var output = compiler.write(tree, fileName);
  return Promise.resolve({
    source: output
  });
}
exports.remap = remap;
