var react = System.pluginLoader._nodeRequire('react-tools');

exports.translate = function(load) {
  var output = react.transformWithDetails(load.source);
	load.source = output.code;
  load.metadata.sourceMap = output.sourceMap;
};
