# Session Store
# -------------
# Allows you to use a persistent session store

persistantStore = false

exports.use = (nameOrModule, config = {}) ->
  persistantStore = if typeof(nameOrModule) == 'object'
    nameOrModule
  else
    try
      require("./persistent_stores/#{nameOrModule}").init(config)
    catch e
      throw new Error("Unable to find the '#{nameOrModule}' persistent session store internally. Please pass a module")

exports.lookup = (sessionId, cb) ->
  if persistantStore
    console.log "store is present"
    persistantStore.lookup sessionId, (obj) ->
      cb(obj)
  else
    console.log "store is missing"
    cb(false)


# Session storage object

class exports.Store

  constructor: (@id) ->
    @userId = null
    @channels = []

  save: (cb) ->
    if persistantStore
      persistantStore.store(@id, @, cb)
    else
      cb(@)