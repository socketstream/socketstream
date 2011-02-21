# Socket Stream Client
# --------------------

# Compiled, minified and cached before being sent to client

# Set the $SS global variable. Wherever possible this should behave in the same was as the server
window.$SS =

  internal:                         # the place for everything the user doesn't need to access
    cb_stack:       {}              # add callbacks to the stack   
  
  events:           {}              # attach event handlers here
  
  config:                           # setup default config
    log:
      level:        0               # no client-side logging by default


# Make the exports variable global so we can access code placed in /app/shared
window.exports = {}

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
  data.type = 'event' if (!data.type)
  Request[data.type](data)

# Connect!
$SS.socket.connect()


# Expose the global 'remote' function
window.remote = ->
  args = arguments
  method = args[0]
  method = "#{$SS.config.remote_prefix}.#{method}" if $SS.config.remote_prefix
  callback = args[args.length - 1]
  params = if args.length >= 3 then args[1] else null
  options = if args.length >= 4 then args[2] else null
  
  callback.options = options
  
  try
    if ($SS.socket.connected == false && $SS.socket.connecting == false)
      $SS.socket.ready = false
      $SS.socket.connect()
      throw 'NOT_READY'  
    else
      if $SS.socket.ready == true
        cb_id = null
        cb_id = Math.random().toString().split('.')[1]
        window.$SS.internal.cb_stack[cb_id] = callback
        console.log('<- ' + method) if (validLevel(4) && !(options && options.silent))
        # TODO: Re-write the client/server messaging API
        msg = JSON.stringify({method: method, params: params, cb_id: cb_id, callee: method, options: options})
        $SS.socket.send(msg)
      else
        throw 'NOT_READY'
  catch e
    # Wait 50 ms and try again if server is not ready
    if e == 'NOT_READY'
      retry_ms = 50
      #console.log "Server not ready. Waiting for #{retry_ms}ms and retrying..."
      recursive = -> remote.apply(@, args)
      setTimeout(recursive, retry_ms) 
    else
      throw e
  
  undefined # Always return this


# PRIVATE MODULES

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
  
  # Displays any application errors in the browser's console
  error: (details) ->
    error('SocketStream Application Error: ' + details[1])


# Incoming requests are sent to one of the following processors
Request =

  system: (data) ->
    System[data.method](data.params)

  callback: (data) ->
    cb = $SS.internal.cb_stack[data.cb_id]
    silent = (cb.options and cb.options.silent)
    log 2, '-> ' + data.callee
    console.log(data.params) if data.params and validLevel(3) and !silent
    cb(data.params)
    delete $SS.internal.cb_stack[data.cb_id]
  
  event: (data) ->
    console.log('=> ' + data.event) if validLevel(2)
    $SS.events[data.event](data.params)


# PRIVATE HELPERS

log = (level, msg) ->
  console.log(msg) if validLevel(level)

error = (e) ->
  console.error(e) if validLevel(1)

validLevel = (level) ->
  $SS.config.log.level >= level