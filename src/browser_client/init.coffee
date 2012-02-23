# SocketStream Browser Client
# ---------------------------
# The code in this file is always sent to the browser, regardless which websocket transport is used

window.SocketStream =
  modules:     {}
  apis:        {}
  transport:   null
  event:       (new EventEmitter2())
  message:     (new EventEmitter2())


SocketStream.registerApi = (name, fn) ->
  api = SocketStream.apis[name]
  if api
    console.error "SocketStream Error: Unable to register the 'ss.#{name}' responder as this name has already been taken"
  else
    SocketStream.apis[name] = fn

# Highly experimental client-side require() code
# TODO: Would love someone to contribute an enhanced version of require which correctly deals 
# with './' and '../' as per https://github.com/joyent/node/blob/master/lib/module.js
# Note modules are cached once loaded, as in Node.js
moduleCache = {}
SocketStream.require = (name, currentPath = null) ->
  return cache if cache = moduleCache[name]
  if mod = SocketStream.modules[name]
    exports = {}
    req = (name) -> SocketStream.require(name, mod.path)
    mod.mod(exports, req)
    moduleCache[name] = exports
  else
    console.error "SocketStream Error: Module #{name} not found. Ensure client dirs containing modules are loaded first and that calls from one module to another are nested within functions"

# Highly experimental asynchronous loading of additional client-side modules
# Pass the name of a module file (complete with file extension), or name of a directory in /client/code
# Be sure to designate additional module directories as such with ss.client.wrapCode('module', 'myextramodsdir')
async = {loaded: {}, loading: new EventEmitter2()}
SocketStream.loadAsync = (nameOrDir, cb) ->
  # Requires jQuery for now
  return console.error('SocketStream Error: loadAsync() command requires jQuery to present') unless jQuery
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
    $.ajax({url: "/_serveAsync/code?#{nameOrDir}", type: 'GET', cache: false, dataType: 'script', success: onSuccess, error: onError})
    

# Basic Cookie getting and setting for use by Session. These methods may also be used by app if desired
SocketStream.cookie =

  read: (c_name) ->
    if document.cookie.length > 0
      c_start = document.cookie.indexOf(c_name + "=")
      if c_start != -1
        c_start = c_start + c_name.length + 1
        c_end = document.cookie.indexOf(";",c_start)
        c_end = document.cookie.length if c_end == -1
        return unescape(document.cookie.substring(c_start,c_end))
    ''

  write: (c_name, value, expiredays = null) ->
    exdate = new Date()
    exdate.setDate(exdate.getDate() + expiredays)
    c = "#{c_name}=#{escape(value)}"
    document.cookie = "#{c_name}=#{escape(value)}" + (if expiredays == null then "" else ";expires=" + exdate.toUTCString())

# Reload browser if reload system event receieved
SocketStream.event.on '__ss:reload', ->
  console.log('Reloading as files have changed...')
  window.location.reload()