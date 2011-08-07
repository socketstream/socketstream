# Main Web Server
# ---------------
# Brokers incoming socket and HTTP connections

fs = require('fs')
util = require('util')
http = require('http')
connect = require('connect')
socketio = require('socket.io')

# Load mandatory modules
socket          = require('./socket')
asset           = require('./asset')
http_middleware = require('./http_middleware')
utils           = require('./utils.coffee')

# The main method called when starting the front end server
exports.start = ->
  
  # Initialize the Asset Manager
  asset.init()
  
  # Start Primary Server (either HTTP or HTTPS)
  primary = SS.internal.servers.primary = primaryServer()

  # Respond to incoming Socket connections
  SS.io = socketio.listen(primary.server)

  # Set default Socket.IO conf
  SS.io.set 'log level', 2 # 3 and above are very noisy
  SS.io.set 'transports', ['websocket', 'flashsocket', 'xhr-polling']

  # Run any custom configuration in /config/app.coffee
  SS.config.socketio.configure(SS.io) if SS.config.socketio?.configure

  # Process events in socket.coffee upon connection
  SS.io.sockets.on 'connection', socket.connection
  
  # Listen for HTTP(S) requests
  primary.server.listen(primary.config.port, primary.config.hostname)
  
  # Start Secondary HTTP Redirect/API server (if running HTTPS)
  # We will architect this way better in the near future
  if SS.config.https.enabled
    secondary = SS.internal.servers.secondary = secondaryServer()
    secondary.server.listen(secondary.config.port, secondary.config.hostname)

  # Return server information so details can be shown on startup banner
  SS.internal.servers


# PRIVATE

# Load the correct server module depending upon HTTPS
primaryServer = ->
  
  if SS.config.https.enabled
    ssl = require('./ssl')
    out =  
      server:    http_middleware.primary(ssl.keys.options())
      config:    SS.config.https
      protocol:  'https'
  else
    out =
      server:    http_middleware.primary()
      config:    SS.config.http
      protocol:  'http'
  
  out

# The secondary server runs on HTTP when HTTPS is enabled
secondaryServer = ->
  server:     http_middleware.secondary()
  config:     SS.config.http
  protocol:   'http'