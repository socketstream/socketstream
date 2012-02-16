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

exports.init = (root) ->
  templateEngines = {}
  defaultEngine = null
  prevEngine = null

  # Set the Default Engine - simply wraps each template in a <script> tag
  defaultEngine = require('./template_engines/default').init(root)

  # Use a template engine for the 'dirs' indicated (will use it on all '/' dirs within /client/templates by default)
  use: (nameOrModule, dirs = ['/'], config) ->

    # Pass the name of an existing wrapper or pass your own module with a process() function
    mod = if typeof(nameOrModule) == 'object'
      nameOrModule
    else
      modPath = "./template_engines/#{nameOrModule}"
      if require.resolve(modPath)
        require(modPath)
      else
        throw new Error("The #{nameOrModule} template engine is not supported by SocketStream internally. Please pass a compatible module instead")

    engine = mod.init(root, config)

    dirs = [dirs] unless dirs instanceof Array
    dirs.forEach (dir) ->
      unless dir.substring(0,1) == '/'
        throw new Error("Directory name '#{dir}' passed to second argument of ss.client.templateEngine.use() command must start with /")
      templateEngines[dir] = engine

  generate: (root, templateDir, files, formatters, cb) ->
    prevEngine = null
    templates = []

    files.forEach (path) ->
      fullPath = pathlib.join(root, templateDir, path)
      engine = tlib.selectEngine(templateEngines, path) || defaultEngine

      # Try and guess the correct formatter to use BEFORE the content is sent to the template engine
      extension = pathlib.extname(path)
      extension = extension.substring(1) if extension
      formatter = (f = formatters[extension]) && f.assetType == 'html' && f

      # Optionally allow engine to select a different formatter
      # This is useful for edge cases where .jade files should be compiled by the engine, not the formatter
      formatter = engine.selectFormatter(path, formatters, formatter) if engine.selectFormatter

      # If we still don't have a formatter by this point, default to 'HTML' (echo/bypass)
      formatter ||= formatters['html']

      # Use the formatter to pre-process the template before passing it to the engine
      formatter.compile fullPath, {}, (output) ->
        templates.push  tlib.wrapTemplate(output, path, engine, prevEngine)
        prevEngine = engine

        # Return if last template
        if templates.length == files.length
          output = templates.join('')
          output += engine.suffix() if engine != null and engine.suffix
          cb(output)

