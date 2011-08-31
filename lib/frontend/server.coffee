# Main Web Server
# ---------------
# Brokers incoming socket and HTTP connections

https       = require('http')
connect     = require('connect')

socket      = require('./socket')
asset       = require('./asset')
middleware  = require('./http_middleware')
utils       = require('./utils.coffee')


# The main method called when starting the front end server
exports.start = ->
  
  # Initialize the Asset Manager
  asset.init()
  
  # Start Primary Server (either HTTP or HTTPS)
  primary = SS.internal.servers.primary = primaryServer()
  
  # Listen for HTTP(S) requests
  primary.server.listen(primary.config.port, primary.config.hostname)

  # Listen for Socket.IO connections
  socket.init(primary.server)
  
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
      server:    middleware.primary(ssl.keys.options())
      config:    SS.config.https
      protocol:  'https'
  else
    out =
      server:    middleware.primary()
      config:    SS.config.http
      protocol:  'http'
  
  out

# The secondary server runs on HTTP when HTTPS is enabled
secondaryServer = ->
  server:     middleware.secondary()
  config:     SS.config.http
  protocol:   'http'