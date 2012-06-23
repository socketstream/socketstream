# Template Engine
# ---------------
# By default client-side templates are concatted and sent to the client using the 'default' wrapper
# (a basic script tag with an ID generated from the file path). However you can easily specify your own template
# engine in your app.js file with the ss.client.templateEngine.use() command
# You may combine several types of template engines together - very useful when converting a site from one format
# to another, or experimenting with different template engines

require('colors')
pathlib = require('path')
formatters = require('./formatters')
client = require('./system')

# Allow Template Engine to be configured
module.exports = (ss) ->

  mods = []

  # Set the Default Engine - simply wraps each template in a <script> tag
  defaultEngine = require('./template_engines/default').init(ss.root)

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

    dirs = [dirs] unless dirs instanceof Array
    engine = mod.init(ss, config)
    mods.push({engine: engine, dirs: dirs})

  load: ->
    templateEngines = {}
    mods.forEach (mod) ->
      mod.dirs.forEach (dir) ->
        unless dir.substring(0,1) == '/'
          throw new Error("Directory name '#{dir}' passed to second argument of ss.client.templateEngine.use() command must start with /")
        templateEngines[dir] = mod.engine
    templateEngines


  # Generate output (as a string) from Template Engines
  generate: (dir, files, cb) ->

    prevEngine = null
    templates = []

    cb('') unless files && files.length > 0

    files.forEach (path) ->
      fullPath = pathlib.join(dir, path)

      # Work out which template engine to use, based upon the path
      engine = selectEngine(ss.client.templateEngines, path.split('/')) || defaultEngine

      # Try and guess the correct formatter to use BEFORE the content is sent to the template engine
      extension = pathlib.extname(path)
      extension = extension.substring(1) if extension
      formatter = (f = ss.client.formatters[extension]) && f.assetType == 'html' && f

      # Optionally allow engine to select a different formatter
      # This is useful for edge cases where .jade files should be compiled by the engine, not the formatter
      formatter = engine.selectFormatter(path, ss.client.formatters, formatter) if engine.selectFormatter

      # If we still don't have a formatter by this point, default to 'HTML' (echo/bypass)
      formatter ||= ss.client.formatters['html']

      # Use the formatter to pre-process the template before passing it to the engine
      try
        formatter.compile fullPath, {}, (output) ->
          templates.push(wrapTemplate(output, path, fullPath, engine, prevEngine))
          prevEngine = engine

          # Return if last template
          if templates.length == files.length
            output = templates.join('')
            output += engine.suffix() if engine != null and engine.suffix
            cb(output)
      catch e
        console.log("! Errror formatting #{formatter.name} template".red)
        console.error(e.message)
        cb('')


# PRIVATE

wrapTemplate = (template, path, fullPath, engine, prevEngine) ->
  output = []

  # If the template type has changed since the last template, include any closing suffix from the last engine used (if present)
  output.push(prevEngine.suffix()) if prevEngine && prevEngine != engine && prevEngine.suffix

  # If this is the first template of this type and it has prefix, include it here
  output.push(engine.prefix()) if (prevEngine == null || prevEngine != engine) && engine.prefix

  # Add main template output and return
  prevEngine = engine
  output.push engine.process(template.toString(), fullPath, suggestedId(path))
  output.join('')

selectEngine = (templateEngines, pathAry) ->
  pathAry.pop() # remove file name
  codePath = '/' + pathAry.join('/')
  engine = templateEngines[codePath]
  if engine == undefined and pathAry.length > 0
    selectEngine(templateEngines, pathAry)
  else
    engine

# Suggest an ID for this template based upon its path
# 3rd party Template Engine modules are free to use their own naming conventions but we recommend using this where possible
suggestedId = (path) ->
  sp = path.split('.')
  sp.pop() if path.indexOf('.') > 0
  sp.join('.').replace(/\//g, '-')
