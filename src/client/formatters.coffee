# Code Formatters
# ---------------
# Loads default code formatters and presents an API for loading custom formatters

mods = []

exports.init = (root) ->

  add = (nameOrModule, config = {}) ->
    mod = if typeof(nameOrModule) == 'object'
      nameOrModule
    else
      modPath = "./formatters/#{nameOrModule}"
      if require.resolve(modPath)
        require(modPath)
      else
        throw new Error("The #{nameOrModule} formatter is not supported by SocketStream internally. Please pass a compatible module instead")

    formatter = mod.init(root, config)
    mods.push(formatter)

  # Load system defaults
  add('javascript')
  add('css')
  add('html')

  ### RETURN API ###
  return {add: add}


exports.load = ->
  byExtension = {}
  mods.forEach (mod) ->
    mod.extensions.forEach (extension) ->
      byExtension[extension] = mod
  byExtension