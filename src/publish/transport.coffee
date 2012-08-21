# Publish Event Transport
# -----------------------
# Right now you can either use the internal transport or inbuilt Redis module
# The idea behind making this modular is to allow others to experiment with other message queues / servers

module.exports = () ->
  
  transport = null
  config = {}

  use: (nameOrModule, cfg = {}) ->
    config = cfg
    transport = if typeof(nameOrModule) == 'function'
      nameOrModule
    else
      modPath = "./transports/#{nameOrModule}"
      if require.resolve(modPath)
        require(modPath)
      else
        throw new Error("Unable to find Publish Event Transport '#{nameOrModule}' internally. Please pass a module")

  load: ->
    @use 'internal' unless transport?
    transport(config)
