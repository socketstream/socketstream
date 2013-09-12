// Simple wrapper for modules

exports.module = function(modPath, code) {
  return "require.define(\"" + modPath + "\", function (require, module, exports, __dirname, __filename){\n" + code + "\n});";
};

exports.htmlTag = {
  css: function(path) {
    return '<link href="' + path + '" media="screen" rel="stylesheet" type="text/css">';
  },
  js: function(path) {
    return '<script src="' + path + '" type="text/javascript"></script>';
  }
};
