# Socket Stream Client
# --------------------

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

  on: (name, funct) ->
    @_events[name] = [] unless @_events[name]?
    @_events[name].push(funct)
  
  emit: (name, params) ->
    if @_events[name]
      event(params) for event in @_events[name]
    else
      console.error "Error: Received incoming '#{name}' event but no event handlers registered"

# Setup the websocket connection
SS.socket = new io.Socket(document.location.hostname, {
  rememberTransport: false,
  port: document.location.port,
  secure: (document.location.protocol == 'https:'),
  transports: ['websocket', 'flashsocket'],
  tryTransportsOnConnectTimeout: false
})

# Process incoming messages over the websocket
SS.socket.on 'message', (raw) ->
  data = JSON.parse(raw)
  if data.type
    if Request[data.type]?
      Request[data.type](data)
    else
      console.error "Error: Unable to find a message handler for '#{data.type}' requests! Dropping message"
  else
    console.error "Error: No message type specified. Dropping message"
  
# Attempt reconnection if the connection is severed
SS.socket.on 'disconnect', ->
  attemptReconnection = ->
    SS.socket.connect() unless SS.socket.connecting
    setTimeout arguments.callee, 500 # try twice per second
  attemptReconnection()

# Handle reloading of the client - 
# TODO check that this is the right place for the code
# TODO change from client-side event broadcast to a SocketStream internal method.
SS.events.on 'reload', (data) -> window.location.reload()
 
# Connect!
SS.socket.connect()

# Define the default callback - simply to console.log out the server's response. Used for debugging from the console
default_cb = (server_response) -> console.log(server_response)

# Sends a command to /app/server code
SS.internal.remote = ->
  args = arguments
  
  # Assemble message
  msg = {type: 'server'}
  msg.method  = args[0]
  msg.method  = "#{SS.config.remote_prefix}.#{msg.method}" if SS.config.remote_prefix
  msg.params  = args[1]
  msg.options = if args.length >= 4 then args[2] else null
  
  # Test to see if the last argument passed is a callback function. It should be, however if we're just testing
  # out a function from the browser's console, use the default callback which simply console.log's the response
  last_arg = args[args.length - 1]
  cb = if typeof(last_arg) == 'function' then last_arg else default_cb
  cb.options = msg.options
  
  # Log if in Developer mode, then send
  console.log('<- ' + msg.method) if (validLevel(4) && !(msg.options && msg.options.silent))
  send(msg, cb)


# Realtime Models - Highly experimental. Disabled by default on the server
class RTM

  findById: (id, cb) ->
    @_send('findById', id, cb)

  find: () ->
    args = []
    args.push(arg) for arg in arguments
    cb = args.pop()
    @_send('find', args, cb)

  _send: (action, params, cb) ->
    log 2, "<~ #{@name}.#{action}"
    send({type: 'rtm', rtm: @name, action: action, params: params}, cb)


# System commands
System =

  # Setup the connection with everything we need to know before we can start processing requests
  init: (data) ->
  
    # Set the SS.env variable. Useful for client-side scripts which need to behave differently depending upon environment loaded
    SS.env = data.env                              
    
    # Copy the client config from the server into SS.config
    SS.config = data.config || {}                  

    # Save the Session ID in a cookie (uses the setCookie method as defined in helpers)
    setCookie('session_id', data.session_id)
  
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

  # Displays any application errors in the browser's console
  error: (details) ->
    error('SocketStream Server - ' + details)


# Incoming requests are sent to one of the following processors
Request =

  system: (data) ->
    System[data.method](data.params)

  server: (data) ->
    cb = SS.internal.cb_stack[data.cb_id]
    silent = (cb.msg.options and cb.msg.options.silent)
    log(2, '-> ' + cb.msg.method, data.params) unless silent
    cb.funkt(data.params)
    delete SS.internal.cb_stack[data.cb_id]
  
  event: (data) ->
    log 2, "=> #{data.event}"
    SS.events.emit(data.event, data.params)

  rtm: (data) ->
    cb = SS.internal.cb_stack[data.cb_id]
    log 2, "~> #{cb.msg.rtm}.#{cb.msg.action}"
    cb.funkt(data.data)
    delete SS.internal.cb_stack[data.cb_id]


# PRIVATE HELPERS

start = ->
  unless SS.started
    # When the DOM has loaded, call the init method. If we're using jQuery, make sure the DOM has loaded first
    if jQuery
      jQuery(document).ready ->
        try
          SS.client.app.init() # new style since 0.0.52
        catch e
          app.init() # maintain compatibilty with older versions until 0.1.0
    else
      app.init()
    SS.started = new Date

send = (msg, cb = null) ->
  args = arguments
  try
    if (SS.socket.connected == false && SS.socket.connecting == false)
      SS.socket.ready = false
      SS.socket.connect()
      throw 'NOT_READY'  
    else
      if SS.socket.ready == true
        if cb
          cb_id = Math.random().toString().split('.')[1]
          SS.internal.cb_stack[cb_id] = {funkt: cb, msg: msg}
          msg.cb_id = cb_id
        msg = JSON.stringify(msg)
        SS.socket.send(msg)
      else
        throw 'NOT_READY'
  catch e
    # Wait 50 ms and try again if server is not ready
    if e == 'NOT_READY'
      retry_ms = 50
      #console.log "Server not ready. Waiting for #{retry_ms}ms and retrying..."
      recursive = -> send.apply(@, args)
      setTimeout(recursive, retry_ms) 
    else
      throw e
  
  undefined # Always return this

log = (level, msg, params) ->
  if validLevel(level)
    o = [msg]
    o.push(params) if params and validLevel(3)
    console.log.apply(console, o)

error = (e) ->
  console.error(e) if validLevel(1)

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
  send({type: 'heartbeat'}) if SS.socket.connected
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

  
