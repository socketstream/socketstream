# Client Asset File
# -----------------
# An asset is a Code (JS or CoffeeScript), CSS or HTML file

log = console.log
fs = require('fs')
pathlib = require('path')
uglifyjs = require('uglify-js')

formatters = require('./formatters')


# Load, compile and minify the following assets

exports.js = (root, path, options, cb) ->
  loadFile root, 'client/code', path, 'js', options, (output) ->
    output = wrapCode(output, path, options.pathPrefix)
    output = minifyJSFile(output, path) if options.compress && !path.indexOf('.min') >= 0
    cb(output)

exports.worker = (root, path, options, cb) ->
  loadFile root, 'client/workers', path, 'js', options, (output) ->
    output = minifyJSFile(output, path) if options.compress
    cb(output)

exports.css = (root, path, options, cb) ->
  loadFile(root, 'client/css', path, 'css', options, cb)

exports.html = (root, path, options, cb) ->
  loadFile(root, 'client/views', path, 'html', options, cb)


# Shared util method: Wrap a code module
exports.wrapModule = wrapModule = (modPath, code) ->
  "require.define(\"#{modPath}\", function (require, module, exports, __dirname, __filename){\n#{code}\n});"


# PRIVATE

loadFile = (root, dir, fileName, type, options, cb) ->
  dir = pathlib.join(root, dir)
  path = pathlib.join(dir, fileName)
  extension = pathlib.extname(path)
  extension = extension && extension.substring(1) # argh!
  formatter = formatters.byExtension[extension]
  throw new Error("Invalid path. Request for #{path} must not live outside #{dir}") if path.substr(0, dir.length) != dir
  throw new Error("Unsupported file extension '.#{extension}' when we were expecting some type of #{type.toUpperCase()} file. Please provide a formatter for #{path.substring(root.length)} or move it to /client/static") unless formatter
  throw new Error("Unable to render '#{fileName}' as this appears to be a #{formatter.assetType.toUpperCase()} file. Expecting some type of #{type.toUpperCase()} file in #{dir.substr(root.length)} instead") unless formatter.assetType == type
  formatter.compile(path.replace(/\\/g, '/'), options, cb) # replace '\' with '/' to support Windows

formatKb = (size) ->
  "#{Math.round(size * 1000) / 1000} KB"

minifyJSFile = (originalCode, fileName) ->
  originalSize = (originalCode.length / 1024)
  minifiedCode = minifyJS(originalCode)
  minifiedSize = (minifiedCode.length / 1024)
  log("  Minified #{fileName} from #{formatKb(originalSize)} to #{formatKb(minifiedSize)}".grey)
  minifiedCode

minifyJS = (originalCode) ->
  jsp = uglifyjs.parser
  pro = uglifyjs.uglify
  ast = jsp.parse(originalCode)
  ast = pro.ast_mangle(ast)
  ast = pro.ast_squeeze(ast)
  pro.gen_code(ast)


# Before client-side code is sent to the browser any file which is NOT a library (e.g. /client/code/libs)
# is wrapped in a module wrapper (to keep vars local and allow you to require() one file in another).
# The 'system' directory is a special case - any module placed in this dir will not have a leading slash
wrapCode = (code, path, pathPrefix) ->
  pathAry = path.split('/')
  
  # Don't touch the code if it's in a 'libs' directory
  return code if 'libs' in pathAry

  # Don't add a leading slash if this is a 'system' module
  if 'system' in pathAry
    modPath = pathAry[pathAry.length-1]
    wrapModule(modPath, code)

  # Otherwise treat as a regular module
  else
    modPath = pathAry.slice(1).join('/')
    # Work out namespace for module
    if pathPrefix
      # Ignore any filenames in the path
      if pathPrefix.indexOf('.') > 0
        sp = pathPrefix.split('/'); sp.pop();
        pathPrefix = sp.join('/')
      modPath = path.substr(pathPrefix.length+1)
    wrapModule('/' + modPath, code)
