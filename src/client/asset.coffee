# Client Asset File
# -----------------
# An asset is a Code (JS or CoffeeScript), CSS or HTML file

log = console.log
fs = require('fs')
pathlib = require('path')
uglifyjs = require('uglify-js')

formatters = require('./formatters')
wrap = require('./wrap')

jsp = uglifyjs.parser
pro = uglifyjs.uglify


# Load, compile and minify the following assets

module.exports = (ss, options) ->

  loadFile = (dir, fileName, type, options, cb) ->
    dir = pathlib.join(ss.root, dir)
    path = pathlib.join(dir, fileName)
    extension = pathlib.extname(path)
    extension = extension && extension.substring(1) # argh!
    formatter = ss.client.formatters[extension]
    throw new Error("Invalid path. Request for #{path} must not live outside #{dir}") if path.substr(0, dir.length) != dir
    throw new Error("Unsupported file extension '.#{extension}' when we were expecting some type of #{type.toUpperCase()} file. Please provide a formatter for #{path.substring(root.length)} or move it to /client/static") unless formatter
    throw new Error("Unable to render '#{fileName}' as this appears to be a #{formatter.assetType.toUpperCase()} file. Expecting some type of #{type.toUpperCase()} file in #{dir.substr(root.length)} instead") unless formatter.assetType == type
    formatter.compile(path.replace(/\\/g, '/'), options, cb) # replace '\' with '/' to support Windows

  # Public

  js: (path, opts, cb) ->
    loadFile options.dirs.code, path, 'js', opts, (output) ->
      output = wrapCode(output, path, opts.pathPrefix)
      output = minifyJSFile(output, path) if opts.compress && !path.indexOf('.min') >= 0
      cb(output)

  worker: (path, opts, cb) ->
    loadFile options.dirs.workers, path, 'js', opts, (output) ->
      output = minifyJSFile(output, path) if opts.compress
      cb(output)

  css: (path, opts, cb) ->
    loadFile(options.dirs.css, path, 'css', opts, cb)

  html: (path, opts, cb) ->
    loadFile(options.dirs.views, path, 'html', opts, cb)


# PRIVATE

formatKb = (size) ->
  "#{Math.round((size / 1024) * 1000) / 1000} KB"

minifyJSFile = (originalCode, fileName) ->
  ast = jsp.parse(originalCode)
  ast = pro.ast_mangle(ast)
  ast = pro.ast_squeeze(ast)
  minifiedCode = pro.gen_code(ast)
  log("  Minified #{fileName} from #{formatKb(originalCode.length)} to #{formatKb(minifiedCode.length)}".grey)
  minifiedCode

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
    wrap.module(modPath, code)

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
    wrap.module('/' + modPath, code)
