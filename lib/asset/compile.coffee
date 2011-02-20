# Asset Compiler - Transforms lovely languages into ancient text

fs = require('fs')
util = require('util')

utils = require('./utils.coffee')

exports.init = (@assets) ->
  @

exports.compile =

  jade: (input_file_name, cb) ->
    file = "#{$SS.root}/app/views/#{input_file_name}"
    
    # Always include links to JS and CSS client-side pre-packed libraries
    inclusions = []
    inclusions.push(exports.tag.js('assets', exports.assets.files.js.lib))
    inclusions.push(exports.tag.css('assets', exports.assets.files.css.lib))
    
    # Typically when in Staging or Production assets are pre-packed, so we include links to them here
    if $SS.config.pack_assets
      inclusions.push(exports.tag.js('assets', exports.assets.files.js.app))
      inclusions.push(exports.tag.css('assets', exports.assets.files.css.app))
    # However, when in Development, we need to iterate through all dirs and include separate links to load each file
    else
      # Include client-side and shared CoffeeScript
      exports.assets.client_dirs.map (dir) ->
        files = utils.fileList "./app/#{dir}", 'app.coffee'
        files.map (file) -> inclusions.push(exports.tag.js(dir, file))
      # Include Stylus files (additional files should be linked from app.styl)
      inclusions.push(exports.tag.css('css', 'app.styl'))
    
    # Include all jQuery templates, if present
    inclusions = inclusions.concat(@_buildTemplates())
    
    # Add code to call app.init() in client (this will be called as soon as SocketStream is ready)
    inclusions.push('<script type="text/javascript">$(document).ready(function() { app = new App(); app.init(); });</script>')
    
    $SS.libs.jade.renderFile file, {locals: {SocketStream: inclusions.join('')}}, (err, html) ->
      cb {output: html, content_type: 'text/html'}

  coffee: (input_file_name, cb) ->
    path = "app/#{input_file_name}"
    input = fs.readFileSync "#{$SS.root}/#{path}", 'utf8'
    try
      js = $SS.libs.coffee.compile(input)
      cb {output: js, content_type: 'text/javascript'}
    catch e
      util.log("\x1B[1;31mError: Unable to compile Coffeescript file #{path} to JS\x1B[0m")
      throw(e) if $SS.config.throw_errors

  styl: (input_file_name, cb) ->
    dir = "app/css"
    path = "#{dir}/#{input_file_name}"
    input = fs.readFileSync "#{$SS.root}/#{path}", 'utf8'
    $SS.libs.stylus.render input, { filename: input_file_name, paths: [dir], compress: $SS.config.pack_assets}, (err, css) ->
      if err
        util.log("\x1B[1;31mError: Unable to compile Stylus file #{path} to CSS\x1B[0m")
        throw(err) if $SS.config.throw_errors
      cb {output: css, content_type: 'text/css'}

  _buildTemplates: ->
    output = []
    files = utils.fileList './app/views'
    files.filter((file) -> !file.match(/\.jade$/)).map (dir) =>
      templates = utils.fileList "./app/views/#{dir}"
      templates.map (template_name) =>
        output.push(@_buildTemplate(dir + '/' + template_name))
    output

  _buildTemplate: (template_path) ->
    path = template_path.split('/').join('-')
    ext = path.split('.').reverse()[0]
    id = path.replace('.' + ext, '')
    file = fs.readFileSync('./app/views/' + template_path, 'utf8')
    try
      html = $SS.libs.jade.render(file);
    catch e
      console.error 'Unable to render jade template: ' + template_path
      throw e
    exports.tag.template(id, html)



# Helpers to generate HTML tags
exports.tag =

  css: (path, name) ->
    '<link href="/' + path + '/' + name + '" media="screen" rel="stylesheet" type="text/css">'
    
  js: (path, name) ->
    '<script src="/' + path + '/' + name + '" type="text/javascript"></script>'
  
  template: (id, contents) ->
    '<script id="' + id + '" type="text/html">' + contents + '</script>'