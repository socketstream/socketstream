# SocketStream Browser Client
# ---------------------------
# The code in this file is always sent to the browser, regardless which websocket transport is used

EventEmitter2 = require('eventemitter2').EventEmitter2

# Setup message emitters
server = exports.server = new EventEmitter2
message = exports.message = new EventEmitter2

# Provide a place to store templates
exports.tmpl = {}

transport = null

exports.assignTransport = (config) ->
  transport = require('socketstream-transport')(server, message, config)
  transport.send = transport.connect()

exports.registerApi = (name, fn) ->
  api = exports[name]
  if api 
    console.error "SocketStream Error: Unable to register the 'ss.#{name}' responder as this name has already been taken"
  else
    exports[name] = fn

exports.send = (responderId) ->
  (msg) -> transport.send(responderId + '|' + msg)


### ON DEMAND LOADING ###

async = {loaded: {}, loading: new EventEmitter2}
exports.load =

  # Enables asynchronous loading of additional client-side modules
  # Pass the name of a module file (complete with file extension), or name of a directory in /client/code
  code: (nameOrDir, cb) ->

    # Strip any leading slash
    nameOrDir = nameOrDir.substr(1) if nameOrDir && nameOrDir.substr(0,1) == '/'

    # Check for errors. Note this feature requires jQuery at the moment
    errorPrefix = 'SocketStream Error: The ss.load.code() command '
    return console.error(errorPrefix + 'requires jQuery to be present') unless jQuery
    return console.error(errorPrefix + 'requires a directory to load. Specify it as the first argument. E.g. The ss.load.code(\'/mail\',cb) will load code in /client/code/mail') unless nameOrDir
    return console.error(errorPrefix + 'requires a callback. Specify it as the last argument') unless cb
 
    # If we've loaded this module or package before, callback right away
    return cb() if async.loaded[nameOrDir]
    
    # Else, register callback and use EE to prevent multiple reqs for the same mod/package to the server before the first responds
    async.loading.once(nameOrDir, cb)
    
    # Retrieve module or directory of modules from the server if this is the first request
    if async.loading.listeners(nameOrDir).length == 1
      onError = ->
        console.error('SocketStream Error: Could not asynchronously load ' + nameOrDir)
        console.log(arguments)
      onSuccess = ->
        async.loaded[nameOrDir] = true
        async.loading.emit(nameOrDir)
      # Send request to server
      $.ajax({url: "/_serve/code?#{nameOrDir}", type: 'GET', cache: false, dataType: 'script', success: onSuccess, error: onError})
  
  # Load Web Workers from /client/workers
  worker: (name) ->
    new Worker("/_serve/worker?#{name}")


### LIVE RELOAD ###

# Reload browser if reload system event received
server.on '__ss:reload', ->
  window.location.reload()

# Reload CSS if only the stylesheets have changed
server.on '__ss:updateCSS', ->
  for tag in document.getElementsByTagName("link")
    if tag.rel.toLowerCase().indexOf("stylesheet") >= 0 and tag.href
      h = tag.href.replace(/(&|%5C?)\d+/, "")
      tag.href = h + (if h.indexOf("?") >= 0 then "&" else "?") + (new Date().valueOf())
  console.log('CSS updated')
