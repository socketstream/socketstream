# Code Formatters
# ---------------
# Loads default code formatters and presents an API for loading custom formatters

mods = []

exports.init = (root) ->

  load: ->
    # Load system defaults
    @add('javascript')
    @add('css')
    @add('html')

    formatters = {}
    mods.forEach (mod) ->
      mod.extensions.forEach (extension) ->
        formatters[extension] = mod
    formatters

  add: (nameOrModule, config = {}) ->
    mod = if typeof(nameOrModule) == 'object'
      nameOrModule
    else
      try
        require("./formatters/#{nameOrModule}")
      catch e
        throw new Error("The #{nameOrModule} formatter is not supported by SocketStream. Please pass a compatible module instead")

    formatter = mod.init(root, config)
    mods.push(formatter)
