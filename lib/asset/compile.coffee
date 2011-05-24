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
    inclusions.push(tag.js('assets', exports.assets.files.js.lib))
    inclusions.push(tag.css('assets', exports.assets.files.css.lib))
    
    # Typically when in Staging or Production assets are pre-packed, so we include links to them here
    if SS.config.pack_assets
      inclusions.push(tag.js('assets', exports.assets.files.js.app))
      inclusions.push(tag.css('assets', exports.assets.files.css.app))
    # However, when in Development, we need to iterate through all dirs and include separate links to load each file
    else
      # Include client-side and shared CoffeeScript
      exports.assets.client_dirs.map (dir) ->
        path = "app/#{dir}"
        files = file_utils.readDirSync(path).files
        if files
          files = utils.ensureCorrectOrder(files)
          files.map (file) ->
            file = file.replace(path + '/', '')
            inclusions.push(tag.js(dir, file))

      # Include Stylus files (additional files should be linked from app.styl)
      inclusions.push(tag.css('css', 'app.styl'))
    
    # Include all jQuery templates, if present
    inclusions = inclusions.concat(buildTemplates())
    SS.libs.jade.renderFile file, {locals: {SocketStream: inclusions.join('')}}, (err, html) ->
      cb {output: html, content_type: 'text/html'}


  coffee: (path, cb) ->
    input = fs.readFileSync "#{SS.root}/#{path}", 'utf8'
    try
      file_ary = path.split('.')[0].split('/')
      input = namespaceSharedFile(input, file_ary, 'coffee') if file_ary[1] == 'shared'
      js = SS.libs.coffee.compile(input)
      cb {output: js, content_type: 'text/javascript'}
    catch err
      e = new Error(e)
      e.name = "Unable to compile CoffeeScript file #{path} to JS"
      e.message = err.message
      e.stack = err.stack
      throw e if SS.config.throw_errors

  js: (path, cb) ->
    js = fs.readFileSync "#{SS.root}/#{path}", 'utf8'
    file_ary = path.split('.')[0].split('/')
    js = namespaceSharedFile(js, file_ary, 'js') if file_ary[1] == 'shared'
    cb {output: js, content_type: 'text/javascript'}

  styl: (input_file_name, cb) ->
    dir = "app/css"
    path = "#{dir}/#{input_file_name}"
    input = fs.readFileSync "#{SS.root}/#{path}", 'utf8'
    SS.libs.stylus.render input, {filename: input_file_name, paths: [dir], compress: SS.config.pack_assets}, (err, css) ->
      if err
        e = Error(err)
        e.name = "Unable to compile Stylus file #{path} to CSS"
        e.message = err.message
        e.stack = err.stack
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
    
# Namespace code in Shared Files
namespaceSharedFile = (input, file_ary, type) ->
  ns = file_ary.splice(2)
  # Add file prefix to ensure we only attach functions to initialized objects
  prefix = ns.map (x, i) -> 
    level = ns.slice(0, i + 1).join('.')
    if type == 'coffee'
      "SS.shared.#{level} = {} unless SS.shared.#{level}"
    else
      "if (typeof(SS.shared.#{level}) == 'undefined') SS.shared.#{level} = {};"
  # Replace calls to exports.X with 'SS.shared.X' to ensure the API is consistent between server and client without any additional overhead
  prefix.join("\n") + "\n" + input.replace(/exports\./g, 'SS.shared.' + ns.join('.') + '.')

