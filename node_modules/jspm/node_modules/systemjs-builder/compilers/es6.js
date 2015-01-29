var traceur = require('traceur');
var ParseTreeTransformer = traceur.get('codegeneration/ParseTreeTransformer.js').ParseTreeTransformer;

function ModuleImportNormalizeTransformer(map) {
  this.map = map;
  return ParseTreeTransformer.apply(this, arguments);
}
ModuleImportNormalizeTransformer.prototype = Object.create(ParseTreeTransformer.prototype);
ModuleImportNormalizeTransformer.prototype.transformModuleSpecifier = function(tree) {
  // shouldn't really mutate, should create a new specifier
  var depName = this.map(tree.token.processedValue) || tree.token.processedValue;
  tree.token.value = "'" + depName + "'";
  return tree;
};


function remap(source, map, fileName) {
  var compiler = new traceur.Compiler();

  var tree = compiler.parse(source, fileName);

  tree = new ModuleImportNormalizeTransformer(map).transformAny(tree);

  return Promise.resolve({
    source: compiler.write(tree)
  });
}
exports.remap = remap;

exports.compile = function(load, opts, loader) {
  var normalize = opts.normalize;
  var options = loader.traceurOptions || {};
  options.modules = 'instantiate';
  options.script = false;
  options.moduleName = load.name;

  if (opts.sourceMaps)
    options.sourceMaps = 'memory';
  if (opts.lowResolutionSourceMaps)
    options.lowResolutionSourceMap = true;

  if (load.metadata.sourceMap)
    options.inputSourceMap = load.metadata.sourceMap;

  var compiler = new traceur.Compiler(options);

  var tree = compiler.parse(load.source, load.address);

  var transformer = new ModuleImportNormalizeTransformer(function(dep) {
    return normalize ? load.depMap[dep] : dep;
  });

  tree = compiler.transform(transformer.transformAny(tree), load.name);

  var source = compiler.write(tree, load.address);
  return Promise.resolve({
    source: source,
    sourceMap: compiler.getSourceMap()
  });
};
