# SocketStream Browser Client
# ---------------------------
# The code in this file is always sent to the browser, regardless which websocket transport is used

window.SocketStream =
  modules:     {}
  moduleCache: {}
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
SocketStream.require = (name, currentPath = null) ->  
  return cache if cache = SocketStream.moduleCache[name]
  if mod = SocketStream.modules[name]
    exports = {}
    req = (name) -> SocketStream.require(name, mod.path)
    mod.mod(exports, req)
    SocketStream.moduleCache[name] = exports
  else
    console.error "SocketStream Error: Module #{name} not found. Ensure client dirs containing modules are loaded first and that calls from one module to another are nested within functions"


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


