# SocketStream Client
# -------------------

# This file is compiled, minified and cached before being sent to client

# Set the SS global variable. Wherever possible this should behave in the same was as the server
window.SS =

  started:          null            # datetime since app.init was called
  env:              null            # environment variable set upon connection to the server

  client:           {}              # load client functions into here
  server:           {}              # load server functions into here
  shared:           {}              # load shared functions into here
  models:           {}              # load real time models into here

  internal:                         # the place for everything the user doesn't need to access
    cb_stack:       {}              # add callbacks to the stack
  
  config:                           # setup default config. this gets overwritten upon connection to server
    log:
      level:        0               # no client-side logging by default
      
# Event handling
SS.events =

  _events: {}

  on: (name, fn) ->
    @_events[name] = [] unless @_events[name]?
    @_events[name].push(fn)
  
  emit: ->
    [name, params...] = arguments
    if @_events[name]
      event.apply(event, params) for event in @_events[name]
    else
      console.error "Error: Received incoming '#{name}' event but no event handlers registered"

# Necessary hack until Socket.IO can detect SSL port correctly (tries to use port 80 without this)
connectionString = ->
  port = if document.location.port.length == 0
    if document.location.protocol == 'https:' then 443 else 80
  else
    document.location.port
  document.location.protocol + '//' + document.location.hostname + ':' + port

# Setup the websocket connection
SS.socket = io.connect(connectionString())

# Define the default callback - simply to console.log out the server's response. Used for debugging from the console
default_cb = (server_response) ->
  console.log(server_response)

# Sends a command to /app/server code
SS.internal.remote = ->
  args = Array.prototype.slice.call(arguments)

  # Test to see if the last argument passed is a callback function. It should be, however if we're just testing
  # out a function from the browser's console, use the default callback which simply console.log's the response
  last_arg = args[args.length - 1]

  # Send supplied callback or use the default ('console.log')
  args.push(default_cb) unless typeof(last_arg) == 'function'
  
  # Assemble message
  msg = {}
  msg.method = args[0]
  msg.method = "#{SS.config.remote_prefix}.#{msg.method}" if SS.config.remote_prefix 
  msg.params = if args.length > 1 then args.slice(1, (args.length - 1)) else null

  # Log if in developer mode
  console.log('<- ' + msg.method) if (validLevel(4) && !(msg.options && msg.options.silent))

  # Send request to front end servers
  cb = args.pop()
  SS.socket.emit 'server', msg, (data) ->
    return backendError(data.error) if data.error
    #silent = (cb.msg.options and cb.msg.options.silent)
    log(2, '-> ' + msg.method, data.result) #unless silent
    cb(data.result)


# Realtime Models - Highly experimental. Disabled by default on the server
class RTM

  findById: (id, cb) ->
    @_send('findById', id, cb)

  find: ->
    args = []
    args.push(arg) for arg in arguments
    cb = args.pop()
    @_send('find', args, cb)

  count: ->
    args = []
    args.push(arg) for arg in arguments
    cb = args.pop()
    @_send('count', args, cb)

  _send: (action, params, cb) ->
    log 2, "<~ #{@name}.#{action}"
    SS.socket.emit 'rtm', {rtm: @name, action: action, params: params}, cb


### SYSTEM RESPONDERS ###

# Get the Session ID from the cookie if it exists
SS.socket.on 'getSessionID', (data, cb) ->
  cb getCookie('session_id')

# System Init
SS.socket.on 'init', (msg) ->

  data = JSON.parse(msg)

  # Set the SS.env variable. Useful for client-side scripts which need to behave differently depending upon environment loaded
  SS.env = data.env                              
  
  # Copy the client config from the server into SS.config
  SS.config = data.config || {}                  

  # Save the Session ID in a cookie (uses the setCookie method as defined in helpers)
  setCookie('session_id', data.session_id) if data.session_id

  # Passes through the names of RTMs loaded on the server, if any
  for name in data.api.models
    SS.models[name] = new RTM
    SS.models[name].name = name

  # Load Server API tree into SS.server
  eval('SS.server = ' + data.api.server)
  setupAPI(SS.server, [])
  
  # Indicate we're ready to send
  SS.socket.ready = true
  
  # If User Online tracking is enabled, send a heartbeat to the server every SS.config.users.online.heartbeat_secs
  sendHeartbeat() if data.heartbeat
  
  # Call app.init (if not previously run)
  start()

# Reload the browser window (normally when the underlying code changes in Dev mode)
SS.socket.on 'reload', ->
  if SS.config.auto_reload
    console.log 'Reloading as files have changed...'
    window.location.reload()


### MAIN RESPONDERS ####

# Respond to incoming events
SS.socket.on 'event', (msg, destination) ->
  data = JSON.parse(msg)
  info = destination && (' [' + destination + ']') || ''
  log 2, "=> #{data.event}#{info}"
  SS.events.emit(data.event, data.params, destination)

# Respond to Real Time Model requests
SS.socket.on 'rtm', (msg) ->
  data = JSON.parse(msg)
  cb = SS.internal.cb_stack[data.id]
  if cb
    log 2, "~> #{cb.msg.rtm}.#{cb.msg.action}"
    cb.funkt(data.data)
    delete SS.internal.cb_stack[data.id]


### PRIVATE HELPERS ###

start = ->
  unless SS.started
    # When the DOM has loaded, call the init method. If we're using jQuery, make sure the DOM has loaded first
    init = SS.client.app.init
    if jQuery
      jQuery(document).ready -> init()
    else
      init()
    SS.started = new Date

# Displays any application errors in the browser's console
backendError = (error) ->
  msg = 'SocketStream Server Error: '
  msg += error.code + ' - ' if error.code
  msg += error.message
  msg += "\n#{error.stack}" if error.stack
  console.error msg

log = (level, msg, params) ->
  if validLevel(level)
    o = [msg]
    o.push(params) if params and validLevel(3)
    console.log.apply(console, o)

validLevel = (level) ->
  SS.config.log.level >= level
  
setupAPI = (root, ary) ->
  for key, value of root
    ns = ary.slice(0)
    ns.push(key)
    if typeof(value) == 'object'
      setupAPI(root[key], ns)
    else
      root[key] = new Function('SS.internal.remote.apply(window, ["' + ns.join('.') + '"].concat(Array.prototype.slice.call(arguments, 0)))')

sendHeartbeat = ->
  SS.socket.emit 'heartbeat' if SS.socket.socket.connected
  setTimeout arguments.callee, (SS.config.heartbeat_interval * 1000)
  
getCookie = (c_name) ->
  if document.cookie.length > 0
    c_start = document.cookie.indexOf(c_name + "=")
    if c_start != -1
      c_start = c_start + c_name.length + 1
      c_end = document.cookie.indexOf(";",c_start)
      c_end = document.cookie.length if c_end == -1
      return unescape(document.cookie.substring(c_start,c_end))
  ""

setCookie = (c_name, value, expiredays) ->
  exdate = new Date()
  exdate.setDate(exdate.getDate() + expiredays)
  document.cookie = "#{c_name}=#{escape(value)}" + (if expiredays == null then "" else ";expires=" + exdate.toUTCString())
