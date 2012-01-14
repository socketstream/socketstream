# Template Engine
# ---------------
# For now we're simply concatting template files together. We will probably to do more here in the near future, 
# possibly pre-compiling them using optional template modules

require('colors')
fs = require('fs')
pathlib = require('path')

exports.init = (root) ->

  generate: (root, templatePath, files, formatters, cb) ->
    templates = []

    files.forEach (path) ->
      extension = pathlib.extname(path)
      extension = extension.substring(1) if extension # argh!
      formatter = formatters[extension]

      throw new Error("Unable to load client side template #{path} because no formatter exists for .#{extension} files") unless formatter?
      throw new Error("Formatter is not for HTML files") unless formatter.assetType == 'html'

      fullPath = pathlib.join(root, templatePath, path)
      
      formatter.compile fullPath, {}, (output) ->
        templates.push wrap(path, output)
        cb(templates.join('')) if templates.length == files.length # return if last one
        

# Private

wrap = (path, template) ->
  sp = path.split('.')
  sp.pop() if path.indexOf('.') > 0
  id = 'tmpl-' + sp.join('.').replace('/', '-')
  '<script id="' + id + '" type="text/x-tmpl">' + template.toString() + '</script>'
