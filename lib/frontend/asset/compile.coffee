# Asset Compiler
# --------------
# Transforms lovely languages into ancient text

fs = require('fs')
util = require('util')
coffee = require('coffee-script')
jade = require('jade')
stylus = require('stylus')

templates = require('./templates.coffee')

utils = require('./utils.coffee')
file_utils = require('../../utils/file.js')

exports.init = (@assets) -> 
  @

exports.compile =

  jade: (input_file_name, cb) ->
    input = "#{SS.root}/app/views/#{input_file_name}"
    
    # Replace the 'SocketStream' magic keyword within the Jade file with all the asset inclusions
    locals = {locals: {SocketStream: headersAndTemplates().join('')}}
    
    jade.renderFile input, locals, (err, html) ->
      if err
        e = new Error(err)
        e.name = "Unable to compile Jade file #{input} to HTML"
        throw e if SS.config.throw_errors
      cb {output: html, content_type: 'text/html'}
  
  html: (path, cb) ->
    html = fs.readFileSync "#{SS.root}/app/views/#{path}", 'utf8'
    
    # Replace the 'SocketStream' magic attribute within the HTML file with all the asset inclusions
    html = html.replace '<SocketStream>', headersAndTemplates().join('')
    
    cb {output: html, content_type: 'text/html'}
    
  
  coffee: (path, cb) ->
    input = fs.readFileSync "#{SS.root}/#{path}", 'utf8'
    try
      file_ary = path.split('.')[0].split('/')
      input = namespaceClientFile(input, file_ary, 'coffee')
      js = coffee.compile(input)
      cb {output: js, content_type: 'text/javascript; charset=utf-8'}
    catch err
      e = new Error(err)
      e.name = "Unable to compile CoffeeScript file #{path} to JS"
      throw e if SS.config.throw_errors

  js: (path, cb) ->
    js = fs.readFileSync "#{SS.root}/#{path}", 'utf8'
    file_ary = path.split('.')[0].split('/')
    js = namespaceClientFile(js, file_ary, 'js')
    cb {output: js, content_type: 'text/javascript; charset=utf-8'}

  styl: (input_file_name, cb) ->
    dir = "app/css"
    path = "#{dir}/#{input_file_name}"
    input = fs.readFileSync "#{SS.root}/#{path}", 'utf8'
    stylus.render input, {filename: input_file_name, paths: [dir], compress: SS.config.pack_assets}, (err, css) ->
      if err
        e = Error(err)
        e.name = "Unable to compile Stylus file #{path} to CSS"
        throw e if SS.config.throw_errors
      cb {output: css, content_type: 'text/css'}


# PRIVATE

# Helpers to generate HTML tags
tag =

  css: (path, name) ->
    '<link href="/' + path + '/' + name + '" media="screen" rel="stylesheet" type="text/css">'

  js: (path, name) ->
    '<script src="/' + path + '/' + name + '" type="text/javascript"></script>'

# Namespace code in Client and Shared Files
namespaceClientFile = (input, file_ary, ext) ->
  type = file_ary[1]
  ns = file_ary.splice(2)
  # Add file prefix to ensure we only attach functions to initialized objects
  prefix = ns.map (x, i) -> 
    level = ns.slice(0, i + 1).map((file) -> "['#{file}']").join('')
    if ext == 'coffee'
      "SS.#{type}#{level} = {} unless SS.#{type}#{level}"
    else
      "if (typeof(SS.#{type}#{level}) == 'undefined') SS.#{type}#{level} = {};"
  # Replace calls to exports.X with 'SS.{type}.X' to ensure the API is consistent between server and client without any additional overhead
  prefix.join("\n") + "\n" + input.replace(/exports\./g, ("SS.#{type}" + ns.map((file) -> "['#{file}']").join('') + '.'))


# Gets CSS/JS headers and jQuery templates
headersAndTemplates = ->
  
  # Always include links to JS and CSS client-side pre-packed libraries
  inclusions = []
  
  # Include CSS
  inclusions.push(tag.css('assets', exports.assets.files.css.lib))
  if SS.config.pack_assets
    inclusions.push(tag.css('assets', exports.assets.files.css.app))
  else
    inclusions.push(tag.css('css', 'app.styl')) # additional files should be linked from app.styl
  
  # Include JS
  inclusions.push(tag.js('assets', exports.assets.files.js.lib))
  if SS.config.pack_assets
    inclusions.push(tag.js('assets', exports.assets.files.js.app))
  else
    # When in Development/Staging, we need to iterate through all dirs and include separate links to load each file
    exports.assets.client_dirs.map (dir) ->
      path = "app/#{dir}"
      files = file_utils.readDirSync(path).files
      if files
        files = utils.ensureCorrectOrder(files)
        files.map (file) ->
          file = file.replace(path + '/', '')
          inclusions.push(tag.js(dir, file))
  
  # Include all jQuery templates, if present
  inclusions = inclusions.concat(templates.buildAll())

  inclusions

