# Asset Compiler
# --------------
# Transforms lovely languages into ancient text

fs = require('fs')
util = require('util')

utils = require('./utils.coffee')
file_utils = require('../utils/file.js')

exports.init = (@assets) -> 
  @

exports.compile =

  jade: (input_file_name, cb) ->
    file = "#{SS.root}/app/views/#{input_file_name}"

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
    inclusions = inclusions.concat(buildTemplates())
    
    # Replace the 'SocketStream' magic keyword within the jade file with all the asset inclusions
    locals = {locals: {SocketStream: inclusions.join('')}}
    
    SS.libs.jade.renderFile file, locals, (err, html) ->
      if err
        e = new Error(err)
        e.name = "Unable to compile Jade file #{file} to HTML"
        throw e if SS.config.throw_errors
      cb {output: html, content_type: 'text/html'}

  coffee: (path, cb) ->
    input = fs.readFileSync "#{SS.root}/#{path}", 'utf8'
    try
      file_ary = path.split('.')[0].split('/')
      input = namespaceClientFile(input, file_ary, 'coffee')
      js = SS.libs.coffee.compile(input)
      cb {output: js, content_type: 'text/javascript'}
    catch err
      e = new Error(err)
      e.name = "Unable to compile CoffeeScript file #{path} to JS"
      throw e if SS.config.throw_errors

  js: (path, cb) ->
    js = fs.readFileSync "#{SS.root}/#{path}", 'utf8'
    file_ary = path.split('.')[0].split('/')
    js = namespaceClientFile(js, file_ary, 'js')
    cb {output: js, content_type: 'text/javascript'}

  styl: (input_file_name, cb) ->
    dir = "app/css"
    path = "#{dir}/#{input_file_name}"
    input = fs.readFileSync "#{SS.root}/#{path}", 'utf8'
    SS.libs.stylus.render input, {filename: input_file_name, paths: [dir], compress: SS.config.pack_assets}, (err, css) ->
      if err
        e = Error(err)
        e.name = "Unable to compile Stylus file #{path} to CSS"
        throw e if SS.config.throw_errors
      cb {output: css, content_type: 'text/css'}


# PRIVATE


# jQuery Templates

buildTemplates = ->
  output = []
  files = utils.fileList './app/views'
  files.filter((file) -> !file.match(/\.jade$/)).map (dir) =>
    templates = utils.fileList "./app/views/#{dir}"
    templates.map (template_name) =>
      output.push(buildTemplate(dir + '/' + template_name))
  output

buildTemplate = (template_path) ->
  path = template_path.split('/').join('-')
  ext = path.split('.').reverse()[0]
  id = path.replace('.' + ext, '')
  file = fs.readFileSync('./app/views/' + template_path, 'utf8')
  try
    html = SS.libs.jade.render(file);
  catch e
    console.error 'Unable to render jade template: ' + template_path
    throw new Error(e)
  tag.template(id, html)


# Helpers to generate HTML tags
tag =

  css: (path, name) ->
    '<link href="/' + path + '/' + name + '" media="screen" rel="stylesheet" type="text/css">'

  js: (path, name) ->
    '<script src="/' + path + '/' + name + '" type="text/javascript"></script>'

  template: (id, contents) ->
    '<script id="' + id + '" type="text/html">' + contents + '</script>'
    
# Namespace code in Client and Shared Files
namespaceClientFile = (input, file_ary, ext) ->
  type = file_ary[1]
  ns = file_ary.splice(2)
  # Add file prefix to ensure we only attach functions to initialized objects
  prefix = ns.map (x, i) -> 
    level = ns.slice(0, i + 1).join('.')
    if ext == 'coffee'
      "SS.#{type}.#{level} = {} unless SS.#{type}.#{level}"
    else
      "if (typeof(SS.#{type}.#{level}) == 'undefined') SS.#{type}.#{level} = {};"
  # Replace calls to exports.X with 'SS.{type}.X' to ensure the API is consistent between server and client without any additional overhead
  prefix.join("\n") + "\n" + input.replace(/exports\./g, "SS.#{type}." + ns.join('.') + '.')

