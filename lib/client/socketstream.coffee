# Socket Stream Client
# --------------------

# Compiled, minified and cached before being sent to client

# Make the exports variable global so we can access code placed in /app/shared
window.exports = {}

# Set the $SS global variable. Wherever possible this should behave in the same was as the server
window.$SS =

  models:           {}              # load models into here

  internal:                         # the place for everything the user doesn't need to access
    cb_stack:       {}              # add callbacks to the stack
  
  config:                           # setup default config
    log:
      level:        0               # no client-side logging by default

# Event handling
$SS.events =

  _events: {}

  on: (name, funct) ->
    @_events[name] = [] unless @_events[name]?
    @_events[name].push(funct)
  
  emit: (name, params) ->
    event(params) for event in @_events[name]

# Setup the websocket connection
$SS.socket = new io.Socket(document.location.hostname, {
  rememberTransport: false,
  port: document.location.port,
  secure: (document.location.protocol == 'https:'),
  transports: ['websocket', 'flashsocket'],
  tryTransportsOnConnectTimeout: false
})

# Process incoming messages over the websocket
$SS.socket.on 'message', (raw) ->
  data = JSON.parse(raw)
  if data.type
    if Request[data.type]?
      Request[data.type](data)
    else
      console.error("Error: Unable to find a message handler for '#{data.type}' requests! Dropping message")
  else
    console.error("Error: No message type specified. Dropping message")
  
# Attempt reconnection if the connection is severed
$SS.socket.on 'disconnect', ->
  attemptReconnection = ->
    unless $SS.socket.connected
      $SS.socket.connect()
      setTimeout(arguments.callee, 50)
  attemptReconnection()
 
# Connect!
$SS.socket.connect()


# Sends a command to /app/server code
window.remote = ->
  args = arguments
  
  # Assemble to message
  msg = {type: 'server'}
  msg.method  = args[0]
  msg.method  = "#{$SS.config.remote_prefix}.#{msg.method}" if $SS.config.remote_prefix
  msg.params  = if args.length >= 3 then args[1] else null
  msg.options = if args.length >= 4 then args[2] else null
  
  # The callback is always the last arugment passed
  cb = args[args.length - 1]
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

  # Tells the client the session has been setup and we're ready to send requests
  ready: ->
    $SS.socket.ready = true

  # Uses the setCookie method as defined in helpers
  setSession: (id) ->
    setCookie('session_id', id)
    log 2, '-> Started new session: ' + id
  
  # Takes the $SS.config.client object set in the server's config file
  setConfig: (client_config) ->
    $SS.config = client_config || {}
  
  # Passes through the names of RTM loaded on the server, if enabled
  setModels: (model_names) ->
    for name in model_names
      $SS.models[name] = new RTM
      $SS.models[name].name = name
  
  # Displays any application errors in the browser's console
  error: (details) ->
    error('SocketStream Application Error: ' + details[1])


# Incoming requests are sent to one of the following processors
Request =

  system: (data) ->
    System[data.method](data.params)

  server: (data) ->
    cb = $SS.internal.cb_stack[data.cb_id]
    silent = (cb.options and cb.options.silent)
    log(2, '-> ' + cb.msg.method, data.params) unless silent
    cb.funkt(data.params)
    delete $SS.internal.cb_stack[data.cb_id]
  
  event: (data) ->
    log 2, "=> #{data.event}"
    $SS.events.emit(data.event, data.params)

  rtm: (data) ->
    cb = $SS.internal.cb_stack[data.cb_id]
    log 2, "~> #{cb.msg.rtm}.#{cb.msg.action}"
    cb.funkt(data.data)
    delete $SS.internal.cb_stack[data.cb_id]


# PRIVATE HELPERS

send = (msg, cb) ->
  args = arguments
  try
    if ($SS.socket.connected == false && $SS.socket.connecting == false)
      $SS.socket.ready = false
      $SS.socket.connect()
      throw 'NOT_READY'  
    else
      if $SS.socket.ready == true
        cb_id = Math.random().toString().split('.')[1]
        window.$SS.internal.cb_stack[cb_id] = {funkt: cb, msg: msg}
        msg.cb_id = cb_id
        msg = JSON.stringify(msg)
        $SS.socket.send(msg)
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
  $SS.config.log.level >= level
