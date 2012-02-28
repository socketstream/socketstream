# Client Asset File
# -----------------
# An asset is a Code (JS or CoffeeScript) or CSS file

log = console.log
fs = require('fs')
uglifyjs = require('uglify-js')
pathlib = require('path')

exports.init = (root, formatters, codeWrappers) ->

  js: (path, options, cb) ->
    fullPath = pathlib.join(root, 'client/code', path)
    loadFile fullPath, formatters, options, (output) ->

      # Wrap code in safety or module wrapper
      output = wrapCode(output, path, codeWrappers)

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

# Code Wrapping - Highly Experimental!
# Before client-side code is sent to the browser, each file can be wrapped in a top-level function wrapper
# (to keep all variables local to that file) or a module wrapper (to allow you to require() a module).
# By default any files in the 'libs' dir are not wrapped and files in 'modules' are wrapped with the module wrapper.
# Files in all other dirs are wrapped with the safety wrapper. This behavior can be overwritten with ss.client.wrapCode()
# All subdirectories inherit their parent's wrapping settings automatically unless overridden explicitly
wrapCode = (code, path, codeWrappers) ->
  pathAry = path.split('/')

  getWrapper = (cb) ->
    pathAry.pop() # remove file name
    codePath = pathAry.join('/')
    wrapper = codeWrappers[codePath]
    if wrapper == undefined and pathAry.length > 1
      getWrapper(cb)
    else
      cb(wrapper)

  getWrapper (wrapper) ->

    # Use the safety function wrapper by default
    wrapper = 'safety' if wrapper == undefined
      
    # Pass the name of an existing wrapper or pass your own module with a process() function
    if wrapper
      if typeof(wrapper) == 'string'
        wrapper = require('./code_wrappers/' + wrapper)
      wrapper.process(code, path)
    else
      code