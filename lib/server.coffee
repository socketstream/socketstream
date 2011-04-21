# Main Web Server
# ---------------
# Brokers incoming socket and HTTP connections

fs = require('fs')
util = require('util')
http = require('http')
https = require('https')

session = require('./session.coffee')
Request = require('./request.coffee')

asset = require('./asset')
api = require('./api')
static = new($SS.libs.static.Server)('./public')

# Only load Realtime Models if enabled. Disabled by default
RTM = require('./realtime_models') if $SS.config.rtm.enabled

exports.start = ->
  asset.init()
  server = mainServer()
  socket = $SS.libs.io.listen(server, {transports: ['websocket', 'flashsocket']})
  socket.on('connection', process.socket.connection)
  socket.on('clientMessage', process.socket.call)
  server.listen($SS.config.port, $SS.config.hostname)
  listenForPubSubEvents(socket)


# PRIVATE

process =

  # HTTP
  http:
    
    call: (request, response) ->
      if $SS.config.api.enabled and api.isValidRequest(request)
        api.call(request, response)
      else if !$SS.config.pack_assets and asset.request.valid(request.url)
        asset.request.serve(request, response)
      else
        request.addListener 'end', ->
          static.serve(request, response)
          $SS.log.staticFile(request)
          
  # Socket.IO
  socket:
  
    # Called when Socket.IO establishes a connection to the server for the first time
    connection: (client) ->
    
      # Inject the 'remote' method into each client instance to 
      client.remote = (msg) -> client.send(JSON.stringify(msg))
      
      # Inject the 'system' helper method which calls an internal system command within the SocketStream client
      client.system = (method, params = {}) -> client.remote({type: 'system', method: method, params: params})
      
      # Create a new session or retrieve an existing one
      session.process client, (this_session) ->
        client.session = this_session                                                # Inject the current session into the client
        client.system 'init',
          session_id:       client.session.id
          env:              $SS.env                                                  # Makes the $SS.env variable available client-side. Can be useful within client code
          config:           $SS.config.client                                        # Copies any client configuration settings from the app config files to the client
          api:                                                                       
            server:         $SS.internal.api_string.server                           # Transmits a string representation of the Server API
            models:         (if RTM then SS.models.keys() else [])                   # Transmits a list of Realtime Models exposed to the client if RTM is enabled (disabled by default)

    # Called each time Socket.IO sends a message through to the server
    call: (data, client) ->
      return null unless client.session.id # drop all calls unless session is loaded
      try
        try
          msg = JSON.parse(data)
        catch e
          throw ['unable_to_parse_message', 'Unable to parse incoming websocket request']
        if msg
          throw ['missing_message_type', "Invalid websocket call. No message handler supplied. Make sure you specific the message 'type'"] unless msg.type
          if process.socket.message[msg.type]?
            process.socket.message[msg.type](msg, client) # Pass the message to the correct message handler
          else
            throw ['invalid_message_type', "Invalid websocket call. No handler to process messages of type '#{msg.type}'"]
        else
          throw ['invalid_message', 'Invalid websocket call. No action supplied']
      catch e
        client.system('error', e)
        $SS.log.error.exception(e)
    
    # Message Handlers (invoked according to the msg.type)
    message:
    
      # Calls to /app/server code
      server: (msg, client) ->
        $SS.log.incoming.socketio(msg, client)                                                  # Log the incoming request
        action_array = msg.method.split('.')                                                    # Turn the incoming action name into an array
        Request.process action_array, msg.params, client.session, (params, options) ->          # Process the request. The Process module is also used by incoming API requests
          $SS.log.outgoing.socketio(msg, client)                                                # Log the outgoing response
          client.remote({type: 'server', cb_id: msg.cb_id, params: params, options: options})   # Send the response back. The cb_id will tell the SocketStream client which callback to execute
      
      # Calls to Realtime Models. Highly experimental and switched off by default
      rtm: (msg, client) ->
        if RTM
          $SS.log.incoming.rtm(msg, client)                                                     # Log the incoming request
          RTM.call msg, (err, data) ->
            client.remote({type: 'rtm', cb_id: msg.cb_id, data: data})                          # Send the response back. The cb_id will tell the SocketStream client which callback to execute
      

# PRIVATE HELPERS

# Redis Pub/Sub
listenForPubSubEvents = (socket) ->
  
  # Appends the message type. TODO: Perform sanity check before blindling forwarding on
  parse = (message) ->
    msg = JSON.parse(message)
    msg.type = 'event'
    msg

  $SS.redis.pubsub.on 'message', (channel, message) =>
    channel = channel.split(':')
    if channel && channel[0] == $SS.config.redis.key_prefix
      switch channel[1]
        when 'user'
          client = $SS.users.connected[channel[2]]
          return if client and client.connected
            $SS.log.outgoing.event("User #{message.user_id}", message)
            client.remote parse(message)
          else
            null
        when 'broadcast'
          $SS.log.outgoing.event("Broadcast", message)
          socket.broadcast JSON.stringify(parse(message))

# Load the correct server module depending upon HTTPS
mainServer = ->
  if $SS.config.ssl.enabled
    https.createServer(ssl.options, process.http.call)
  else
    http.createServer(process.http.call)

# Load the SSL keys
ssl =

  options:
    key:  fs.readFileSync(__dirname + "/../ssl/key.pem")   # look for "#{$SS.root}/config/ssl/key.pem" in the future
    cert: fs.readFileSync(__dirname + "/../ssl/cert.pem")


