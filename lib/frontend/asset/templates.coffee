# Asset Templates
# ---------------
# Allows for jQuery templating (more templating styles will be supported in the future)

fs = require('fs')
utils = require('../../utils/file.js')
jade = require('jade')

exports.buildAll = ->
  files = utils.readDirSync('./app/views').files
  files.map (template_path) ->
    if template_path.split('/').length > 3 # only look in sub-folders
      buildTemplate(template_path) 

# PRIVATE

buildTemplate = (template_path) ->
  path = template_path.split('/').slice(2).join('-')
  ext = path.split('.').reverse()[0]
  id = path.replace('.' + ext, '')
  source = fs.readFileSync(template_path, 'utf8')
  html = compile[ext](template_path, source)
  tag id, html

# Supported dynamic HTML formats (not the micro-templating language used to parse the output)
compile =

  jade: (path, source) ->
    try
      jade.render(source)
    catch e
      console.error 'Unable to render jade template: ' + path
      throw new Error(e)
   
  html: (path, source) ->
    source
      
# Templates are transmitted within script tags
tag = (id, contents) ->
  '<script id="' + id + '" type="text/x-jquery-tmpl">' + contents + '</script>'
