# Socket.IO
# ---------
# Handles incoming web/flash socket clients from Socket.IO

socketio  = require('socket.io')
utils     = require('../utils')
limiter   = require('./rate_limiter.coffee') if SS.config.rate_limiter.enabled
rpc       = new (require('../rpc/connection.coffee')).Client('socketio')

session_length = 32

exports.init = (server) ->

  # Respond to incoming Socket connections
  SS.io = socketio.listen(server)

  # Set default Socket.IO config
  SS.io.set 'log level', 2 # 3 and above are very noisy

  # Run any custom configuration in /config/app.coffee
  SS.config.socketio.configure(SS.io) if SS.config.socketio?.configure

  # Process events in socket.coffee upon connection
  SS.io.sockets.on 'connection', newConnection

 
# PRIVATE

# Called when a Socket.IO client establishes a connection to the server for the first time
newConnection = (socket) ->

  # Define our own namespace to store stuff in
  socket.ss = {}

  # Called when a Socket.IO client disconnects (e.g. user shuts down the browser window, connection times out or RPS limit exceeded)
  socket.on 'disconnect', (reason) ->
    try
      delete SS.internal.sessions[socket.ss.session.id]
      rpc.send {responder: 'client', method: 'disconnect', session: socket.ss.session}


  ### DEFINE INCOMING MESSAGE HANDLERS ###

  # Handle incoming calls to SS.server code
  socket.on 'server', (msg, cb) ->
    preProcess socket, ->
      msg.responder = 'server'
      msg.session = socket.ss.session
      request = rpc.send msg, (response) ->
        updateSessionCache(socket, response)
        cb response

      SS.log.incoming.server(request, socket)
  
  # Handle incoming calls to Realtime Models. Highly experimental and switched off by default
  if SS.config.rtm.enabled
    socket.on 'rtm', (msg, cb) ->
      preProcess socket, ->
        msg.responder = 'rtm'
        msg.session = socket.ss.session
        request = rpc.send msg, (response) ->
          updateSessionCache(socket, response)
          cb response.result
        SS.log.incoming.rtm(request, socket)

  # Pass client heartbeats through to the back end
  socket.on 'heartbeat', ->
    rpc.send {responder: 'client', method: 'heartbeat', session: socket.ss.session}
  

  ### FINALLY, INITIATE SESSION ###

  # Get the existing session_id if we have one then transmit everything we need to the client
  
  socket.emit 'getSessionID', {}, (session_id) ->
    session_id = utils.randomString(session_length) unless session_id.length == session_length
    socket.ss.session = {id: session_id}
    SS.internal.sessions[session_id] = socket
    rpc.send {responder: 'client', method: 'init', session: socket.ss.session}, (response) ->
      result = response.result
      socket.ss.session = result.session
      socket.emit 'init', JSON.stringify(result.send_to_client)

# All incoming requests go through here first
preProcess = (socket, cb) ->
  
  # Disconnect the client if limiter is enabled and requests-per-second have been exceeded
  @disconnect() if limiter and limiter.exceeded(socket)

  cb true

# Update the local cache of the session if there have been any changes
updateSessionCache = (socket, response) ->
  if response.session_updates?
    socket.ss.session[field] = value for field, value of response.session_updates
    delete response.session_updates

