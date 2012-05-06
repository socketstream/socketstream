
exports.module = function(modPath, code) {
  return "require.define(\"" + modPath + "\", function (require, module, exports, __dirname, __filename){\n" + code + "\n});";
};
