# Main Web Server
# ---------------
# Brokers incoming socket and HTTP connections

fs = require('fs')
util = require('util')
http = require('http')

# Load mandatory modules
session         = require('./session.coffee')
Request         = require('./request.coffee')
asset           = require('./asset')
pubsub          = require('./pubsub.coffee')
http_middleware = require('./http_middleware')
utils           = require('./utils/server.coffee')

# Load optional modules
limiter = require('./limiter.coffee') if SS.config.limiter.enabled

# Only load Realtime Models if enabled. Disabled by default
RTM = require('./realtime_models') if SS.config.rtm.enabled

# The main method called when starting the server ('socketstream start')
exports.start = ->
  
  asset.init()
  
  # Start Primary Server (either HTTP or HTTPS)
  primary = SS.internal.servers.primary = primaryServer()
  socket = SS.libs.io.listen(primary.server, {transports: ['websocket', 'flashsocket']})
  socket.on('connection', process.socket.connection)
  socket.on('clientMessage', process.socket.call)
  socket.on('clientDisconnect', process.socket.disconnection)
  primary.server.listen(primary.config.port, primary.config.hostname)
  pubsub.listen(socket)
  
  # Start Secondary HTTP Redirect/API server (if running HTTPS)
  # We will architect this way better in the near future
  if SS.config.https.enabled and SS.config.https.domain and SS.config.https.redirect_http
    request_processor = (request, response) -> process.http.request(request, response, 'secondary')
    secondary = SS.internal.servers.secondary =
      server:     http.createServer(request_processor)
      middleware: http_middleware.secondary()
      config:     SS.config.http
      protocol:   'http'
    secondary.server.listen(secondary.config.port, secondary.config.hostname)

  SS.internal.servers

# PRIVATE

process =

  # HTTP or HTTPS
  http:

    # Primary server deals with incoming HTTP or HTTPS requests
    request: (request, response, server_name) ->
    
      # Attach a custom SocketStream variable to the request object
      request.ss = {}

      # BEGIN POST MESSAGE PATCH
      if request.method.toLowerCase() == 'post'
        incoming_data = ''
        request.on('data', (chunk) ->
          incoming_data += chunk.toString()
        )
        request.on 'end', ->
          request.ss.raw_body = ''
          request.ss.body = {}
          try
            request.ss.raw_body = unescape( incoming_data ) # Save the RAW Body Message just in case
            request.ss.body = parse_nested_query( incoming_data )
          catch e
            throw ['rest_unable_to_parse_params', 'Unable to parse incoming params']
      # END POST MESSAGE PATCH

      # Wait for the request to complete then execute middleware
      request.addListener 'end', -> SS.internal.servers[server_name].middleware.execute(request, response)

  # Socket.IO
  socket:
  
    # Called when a Socket.IO client establishes a connection to the server for the first time
    connection: (client) ->
    
      # Inject the 'remote' method into each client instance to 
      client.remote = (msg) -> client.send(JSON.stringify(msg))
      
      # Inject the 'system' helper method which calls an internal system command within the SocketStream client
      client.system = (method, params = {}) -> client.remote({type: 'system', method: method, params: params})
      
      # Create a new session or retrieve an existing one
      session.process client, (this_session) ->
        client.session = this_session                                               # Inject the current session into the client
        client.system 'init',
          session_id:       client.session.id
          env:              SS.env                                                  # Makes the SS.env variable available client-side. Can be useful within client code
          config:           SS.config.client                                        # Copies any client configuration settings from the app config files to the client
          heartbeat:        SS.config.users.online.enabled                          # Let's the client know if User Online tracking is enabled
          api:                                                                       
            server:         SS.internal.api_string.server                           # Transmits a string representation of the Server API
            models:         (if RTM then SS.models.keys() else [])                  # Transmits a list of Realtime Models exposed to the client if RTM is enabled (disabled by default)

    # Called each time Socket.IO sends a message through to the server
    call: (data, client) ->
      
      # Log each message for debugging (only when log_level >= 5)
      SS.log.incoming.rawMessage(data, client)

      # Silently drop all calls if...
      return null if client.rps_exceeded  # client has exceeded the number of requests-per-second
      return null unless client.session   # session is not loaded

      # Prevent obvious DDOS abuse caused by repeated calls to SS.server from a particular client
      # The number of requests per second can be adjusted with SS.config.limiter.websockets.rps
      if limiter and limiter.exceeded(client)
        SS.log.incoming.rpsExceeded(client)
        return null

      # Attempt to process the request
      try
        client.session.init()  # Necessary to correctly initiate sub-objects
        try
          msg = JSON.parse(data)
        catch e
          throw new Error("Unable to parse incoming websocket request")
        if msg
          throw new Error("Invalid websocket call. No message handler supplied. Make sure you specific the message 'type'") unless msg.type
          if process.socket.message[msg.type]?
            process.socket.message[msg.type](msg, client) # Pass the message to the correct message handler
          else
            throw new Error("Invalid websocket call. No handler to process messages of type '#{msg.type}'")
        else
          throw new Error("Invalid websocket call. No action supplied")
      catch e
        client.system('error', e.toString())
        SS.log.error.exception(e)
    
    # Called when a Socket.IO client disconnects (e.g. User shuts down the browser window)
    disconnection: (client) ->
	    if client.session
        client.session.init()
        client.session._cleanup()  # removes this dead client from any channels
        client.session.emit('disconnect', client.session)

    # Message Handlers (invoked according to the msg.type)
    message:
      
      # Confirms the user is still online
      heartbeat: (msg, client) ->
        SS.users.online.confirm(client.session.user_id) if client.session.user_id

      # Calls to /app/server code
      server: (msg, client) ->
        SS.log.incoming.socketio(msg, client)                                                   # Log the incoming request
        action_array = msg.method.split('.')                                                    # Turn the incoming action name into an array
        Request.process action_array, msg.params, client.session, (params, options) ->          # Process the request. The Process module is also used by incoming API requests
          SS.log.outgoing.socketio(msg, client)                                                 # Log the outgoing response
          client.remote({type: 'server', cb_id: msg.cb_id, params: params, options: options})   # Send the response back. The cb_id will tell the SocketStream client which callback to execute
      
      # Calls to Realtime Models. Highly experimental and switched off by default
      rtm: (msg, client) ->
        if RTM
          SS.log.incoming.rtm(msg, client)                                                      # Log the incoming request
          RTM.call msg, (err, data) ->
            client.remote({type: 'rtm', cb_id: msg.cb_id, data: data})                          # Send the response back. The cb_id will tell the SocketStream client which callback to execute
      

# PRIVATE HELPERS

# Load the correct server module depending upon HTTPS
primaryServer = ->
  request_processor = (request, response) -> process.http.request(request, response, 'primary')
  
  if SS.config.https.enabled
    ssl = require('./ssl')
    https = require('https')
    out =  
      server:    https.createServer(ssl.keys.options(), request_processor)
      config:    SS.config.https
      protocol:  'https'
  else
    out =
      server:    http.createServer(request_processor)
      config:    SS.config.http
      protocol:  'http'
  
  # Load middleware stack
  out.middleware = http_middleware.primary()
  out


# POST parameter parsing ported from Rack's Util module
# https://raw.github.com/rack/rack/master/lib/rack/utils.rb
DEFAULT_SEP = /[&;] */
parse_nested_query = (qs, d) ->
  params = {}

  (qs || '').split( if d? then new RegExp("["+d+"] *") else DEFAULT_SEP ).forEach (p) ->
    [k, v] = p.split('=').map (s) ->
      unescape(s)

    normalize_params( params, k, v )

  return params

normalize_params = (params, name, v) ->
  matches = name.match( /^[\[\]]*([^\[\]]+)\]*/ )

  return unless matches?

  k_sub = matches[0]
  after = name.substring( name.indexOf(k_sub) + k_sub.length )
  k = matches[1]

  if after == ""
    params[k] = v
  else if after == "[]"
    params[k] ||= []
    if params[k] instanceof Array
      params[k].push( v )
    else
      throw "expected Array (got "+(typeof params[k])+") for param `"+k+"'"
  else
    child_key = after.match(/^\[\]\[([^\[\]]+)\]$/) or after.match(/^\[\](.+)$/)
    if child_key
      child_key = child_key[0]
      params[k] ||= []
      if params[k] instanceof Array
        if params[k].last instanceof Object and !(params[k].last instanceof Array) and !params[k].last.key?(child_key)
          normalize_params(params[k].last, child_key, v)
        else
          params[k].push( normalize_params({}, child_key, v) )
      else
        throw "expected Array (got "+(typeof params[k])+") for param `"+k+"'" unless params[k] instanceof Array
    else
      params[k] or= {}
      if params[k] instanceof Object and !(params[k] instanceof Array)
        params[k] = normalize_params(params[k], after, v)
      else
        throw "expected Object (got "+(typeof params[k])+") for param '"+k+"'"

  return params
