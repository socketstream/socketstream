# Template Engine
# ---------------
# By default client-side templates are concatted and sent to the client using the 'default' wrapper
# (a basic script tag with an ID generated from the file path). However you can easily specify your own template
# engine in your app.js file with the ss.client.templateEngine.use() command
# You may combine several types of template engines together - very useful when converting a site from one format
# to another, or experimenting with different template engines

fs = require('fs')
pathlib = require('path')
tlib = require('./lib/template')

templateEngines = {}
defaultEngine = null
prevEngine = null

exports.init = (root) ->

  # Set the Default Engine - simply wraps each template in a <script> tag
  defaultEngine = require('./template_engines/default').init(root)

  # Use a template engine for the 'dirs' indicated (will use it on all '/' dirs within /client/templates by default)
  use: (nameOrModule, dirs = ['/'], config) ->

    # Pass the name of an existing wrapper or pass your own module with a process() function
    if typeof(nameOrModule) == 'string'
      nameOrModule = require('./template_engines/' + nameOrModule)

    engine = nameOrModule.init(root, config)

    dirs = [dirs] unless dirs instanceof Array
    dirs.forEach (dir) ->
      unless dir.substring(0,1) == '/'
        throw new Error("Directory name '#{dir}' passed to second argument of ss.client.templateEngine.use() command must start with /")
      templateEngines[dir] = engine

  generate: (root, templatePath, files, formatters, cb) ->
    prevEngine = null
    templates = []

    files.forEach (path) ->
      extension = pathlib.extname(path)
      extension = extension.substring(1) if extension # argh!
      formatter = formatters[extension]

      throw new Error("Unable to load client side template #{path} because no formatter exists for .#{extension} files") unless formatter?
      throw new Error("Formatter is not for HTML files") unless formatter.assetType == 'html'

      fullPath = pathlib.join(root, templatePath, path)

      formatter.compile fullPath, {}, (output) ->
        engine = tlib.selectEngine(templateEngines, path) || defaultEngine
        templates.push tlib.wrapTemplate(output, path, engine, prevEngine)
        prevEngine = engine

        # Return if last template
        if templates.length == files.length
          output = templates.join('')
          output += engine.suffix() if engine != null and engine.suffix
          cb(output)

