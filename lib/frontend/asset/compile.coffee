# Asset Compiler
# --------------
# Transforms lovely languages into ancient text

fs      = require('fs')
util    = require('util')
coffee  = require('coffee-script')
jade    = require('jade')
stylus  = require('stylus')
less    = require('less')

templates = require('./templates.coffee')

utils = require('./utils.coffee')
file_utils = require('../../utils/file.js')

exports.init = (@assets) -> 
  @

exports.compile =

  # Outputs to JavaScript

  js: (path, cb) ->
    js = fs.readFileSync "#{SS.root}/#{path}", 'utf8'
    file_ary = path.split('.')[0].split('/')
    js = namespaceClientFile(js, file_ary, 'js')
    cb {output: js, content_type: 'text/javascript; charset=utf-8'}

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

  # Outputs to HTML

  html: (path, cb) ->
    html = fs.readFileSync "#{SS.root}/app/views/#{path}", 'utf8'
    # Replace the 'SocketStream' magic attribute within the HTML file with all the asset inclusions
    html = html.replace '<SocketStream>', headersAndTemplates().join('')
    cb {output: html, content_type: 'text/html'}

  jade: (input_file_name, cb) ->
    path = "#{SS.root}/app/views/#{input_file_name}"
    input = fs.readFileSync path, 'utf8'
    # Replace the 'SocketStream' magic keyword within the Jade file with all the asset inclusions
    locals = {SocketStream: headersAndTemplates().join('')}
    try
      parser = jade.compile(input)
      html = parser(locals)
      cb {output: html, content_type: 'text/html'}
    catch e
      e = new Error(e)
      e.name = "Unable to compile Jade file #{path} to HTML"
      throw e if SS.config.throw_errors

  
  # Outputs to CSS

  css: (input_file_name, cb) ->
    file = cssFile(input_file_name)
    cb {output: file.read(), content_type: 'text/css'}

  styl: (input_file_name, cb) ->
    file = cssFile(input_file_name)
    stylus.render file.read(), {filename: input_file_name, paths: [file.dir], compress: SS.config.pack_assets}, (err, css) ->
      if err
        e = Error(err)
        e.name = "Unable to compile Stylus file #{file.relative} into CSS"
        throw e if SS.config.throw_errors
      cb {output: css, content_type: 'text/css'}

  less: (input_file_name, cb) ->
    file = cssFile(input_file_name)
    parser = new(less.Parser)({paths: [file.dir], filename: input_file_name})
    parser.parse file.read(), (err, tree) ->
      if err
        e = Error(err)
        e.name = "Unable to compile Less file #{file.relative} into CSS"
        throw e if SS.config.throw_errors
      css = tree.toCSS({ compress: SS.config.pack_assets })
      cb {output: css, content_type: 'text/css'}


# PRIVATE

cssFile = (file_name) ->
  dir = "app/css"
  relative = "#{dir}/#{file_name}"
  absolute = "#{SS.root}/#{relative}"
  { 
    dir:        dir
    relative:   relative
    absolute:   absolute
    read:       -> fs.readFileSync(absolute, 'utf8')
  }

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
    files = file_utils.readDirSync("app/css").files
    files.forEach (path) ->
      file = path.split('/').last()
      # additional files should be linked from app.styl
      inclusions.push(tag.css('css', file)) if file.split('.')[0] == 'app'

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

