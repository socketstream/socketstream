# Client Asset File
# -----------------
# An asset is a Code (JS or CoffeeScript) or CSS file

log = console.log
fs = require('fs')
uglifyjs = require('uglify-js')
pathlib = require('path')

exports.init = (root, formatters) ->

  js: (path, options, cb) ->
    fullPath = pathlib.join(root, 'client/code', path)
    loadFile fullPath, formatters, options, (output) ->

      # Return unwrapped if need be
      return cb(output) if options.raw == true

      # Wrap code in safety or module wrapper
      output = wrapCode(output, path, options.pathPrefix)

      # If we're packing assets, minify any JS file that doesn't contain .min in the filename
      if options && options.compress
        basename = pathlib.basename(path)
        output = minifyJS(basename, output) unless basename.indexOf('.min') > 0            

      cb(output)

  css: (path, options, cb) ->
    fullPath = pathlib.join(root, 'client/css', path)
    loadFile fullPath, formatters, options, cb


# Private

loadFile = (path, formatters, options, cb) ->
  extension = pathlib.extname(path)
  extension = extension && extension.substring(1) # argh!
  formatter = formatters[extension]
  throw new Error("Unsupported file extension '.#{extension}'. Please provide a formatter for #{path} or remove it from your project") unless formatter
  formatter.compile path, options, cb

minifyJS = (file_name, orig_code) ->
  formatKb = (size) -> "#{Math.round(size * 1000) / 1000} KB"
  orig_size = (orig_code.length / 1024)
  jsp = uglifyjs.parser
  pro = uglifyjs.uglify
  ast = jsp.parse(orig_code)
  #ast = pro.ast_mangle(ast)
  ast = pro.ast_squeeze(ast)
  minified = pro.gen_code(ast)
  min_size = (minified.length / 1024)
  log("  Minified #{file_name} from #{formatKb(orig_size)} to #{formatKb(min_size)}".grey)
  minified

# Before client-side code is sent to the browser any file which is NOT a library (e.g. /client/code/libs)
# is wrapped in a module wrapper (to keep vars local and allow you to require() one file in another).
# /client/code/system is a special case - any module placed in this dir will not have a leading slash
wrapCode = (code, path, pathPrefix) ->
  pathAry = path.split('/')
  
  # Get immidiate dir name
  dirName = pathAry[pathAry.length-2]
  
  switch dirName
    # Don't touch the code if it's in a 'libs' directory
    when 'libs'
      code
    # Don't add a leading slash if this is a system module
    when 'system'
      modPath = pathAry[pathAry.length-1]
      wrapModule(modPath, code)
    # Otherwise assume this is a regular module
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

  
# Return wrapped code
wrapModule = (modPath, code) -> 
  "require.define(\"#{modPath}\", function (require, module, exports, __dirname, __filename){\n#{code}\n});"

