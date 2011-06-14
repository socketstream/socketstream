# Main Web Server
# ---------------
# Brokers incoming socket and HTTP connections

fs = require('fs')
util = require('util')
http = require('http')
https = require('https')

# Load mandatory modules
session = require('./session.coffee')
Request = require('./request.coffee')
asset   = require('./asset')
pubsub  = require('./pubsub.coffee')

# Load optional modules
limiter = require('./limiter.coffee')   if SS.config.limiter.enabled

# Load Default HTTP Middleware Stack (order matters!)
http_middleware = []
http_middleware.push('api')             if SS.config.api.enabled
http_middleware.push('browser_check')   if SS.config.browser_check.enabled
http_middleware.push('admin')           if SS.config.admin.enabled
http_middleware.push('compile')         if !SS.config.pack_assets
http_middleware.push('static')          # Always serve static files last

# Only load Realtime Models if enabled. Disabled by default
RTM = require('./realtime_models') if SS.config.rtm.enabled

# The main method called when starting the server ('socketstream start')
exports.start = ->
  asset.init()
  server = mainServer()
  socket = SS.libs.io.listen(server, {transports: ['websocket', 'flashsocket']})
  socket.on('connection', process.socket.connection)
  socket.on('clientMessage', process.socket.call)
  socket.on('clientDisconnect', process.socket.disconnection)
  server.listen(SS.config.port, SS.config.hostname)
  pubsub.listen(socket)


# PRIVATE

process =

  # HTTP
  http:
    
    # Every incoming HTTP request goes though this method, so it must be optimized at all times
    call: (request, response) ->
      appendParsedURL(request)
      request.addListener 'end', ->
        executeMiddleware(0, request, response)

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
          heartbeat:        SS.config.users.online.enabled                          # Let's the client know if User Online tracking is enabled. Change heartbeat timing with SS.config.client.heartbeat_seconds (default = 60)
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
mainServer = ->
  if SS.config.ssl.enabled
    https.createServer(ssl.options, process.http.call)
  else
    http.createServer(process.http.call)

# Parses incoming URL into file extension, initial dir etc and adds this object to request.parsedURL
appendParsedURL = (request) ->
  raw = request.url
  [no_params, params] = raw.split('?')
  [url, extension] = no_params.split('.')
  [ignore, initialDir, actions...] = url.split('/')
  request.parsedURL = 
    extension:   (if extension and extension != '/' then extension.toLowerCase() else null)
    initialDir:  (if initialDir then initialDir.toLowerCase() else null)
    actions:     (actions || null)
    params:      (params || null)
    path:        (if actions.length > 0 then [actions.join('/'), extension].join('.') else '')
    isRoot:      (u = url.split('?')[0].split('/'); u.length == 2 and !raw.split('?')[0].match(/\./))

# Execute HTTP Middleware recursively
executeMiddleware = (index, request, response) ->
  name = http_middleware[index]
  middleware = require("./middleware/#{name}")
  if middleware.isValidRequest(request)
    middleware.call(request, response)
  else
    arguments.callee(index + 1, request, response)

# Load the SSL keys. All very experimenal at the moment!
ssl =

  options:
    key:  fs.readFileSync(__dirname + "/../ssl/key.pem")   # look for "#{SS.root}/config/ssl/key.pem" in the future
    cert: fs.readFileSync(__dirname + "/../ssl/cert.pem")


