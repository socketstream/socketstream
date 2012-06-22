# Simple wrapper for modules

exports.module = (modPath, code) ->
  "require.define(\"#{modPath}\", function (require, module, exports, __dirname, __filename){\n#{code}\n});"

exports.htmlTag =

  css: (path) ->
    '<link href="' + path + '" media="screen" rel="stylesheet" type="text/css">'

  js: (path) ->
    '<script src="' + path + '" type="text/javascript"></script>'
