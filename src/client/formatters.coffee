# Code Formatters
# ---------------
# Loads default code formatters and presents an API for loading custom formatters

module.exports = (ss) ->

  mods = []

  add: (nameOrModule, config = {}) ->
    mod = if typeof(nameOrModule) == 'object'
      nameOrModule
    else
      modPath = "./formatters/#{nameOrModule}"
      if require.resolve(modPath)
        require(modPath)
      else
        throw new Error("The #{nameOrModule} formatter is not supported by SocketStream internally. Please pass a compatible module instead")

    formatter = mod.init(ss.root, config)
    mods.push(formatter)

  load: ->
    byExtension = {}
    mods.forEach (mod) ->
      mod.extensions.forEach (extension) ->
        byExtension[extension] = mod
    byExtension