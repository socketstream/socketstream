# Simple wrapper for modules

exports.module = (modPath, code) ->
  "require.define(\"#{modPath}\", function (require, module, exports, __dirname, __filename){\n#{code}\n});"
