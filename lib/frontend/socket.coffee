# Sockets
# -------
# Handles incoming web/flash socket clients from Socket.IO

utils = require('../utils')
zmqs = new (require('../zmq_async.coffee').Socket)

session_length = 32

# Load optional modules
limiter = require('./limiter.coffee') if SS.config.limiter.enabled

# Called when a Socket.IO client establishes a connection to the server for the first time
exports.connection = (socket) ->

  # Define our own namespace to store stuff in
  socket.ss = {}

  # Called when a Socket.IO client disconnects (e.g. user shuts down the browser window, connection times out or RPS limit exceeded)
  socket.on 'disconnect', (reason) ->
    delete SS.connected.sessions[socket.ss.session_id]
    send socket, 'client:disconnect'


  ### DEFINE INCOMING MESSAGE HANDLERS ###

  # Handle incoming calls to SS.server code
  socket.on 'server', (msg) ->
    preProcess socket, ->
      request = send(socket, 'server', msg)
      SS.log.incoming.server(request, socket)
  
  # Handle incoming calls to Realtime Models. Highly experimental and switched off by default
  if SS.config.rtm.enabled
    socket.on 'rtm', (msg) ->
      preProcess socket, ->
        request = send(socket, 'rtm', msg)
        SS.log.incoming.rtm(request, socket)

  # Pass client heartbeats through to the back end
  socket.on 'heartbeat', ->
    send socket, 'client:heartbeat'
  

  ### FINALLY, INITIATE SESSION ###

  # Get the existing session_id if we have one then transmit everything we need to the client
  
  socket.emit 'getSessionID', {}, (session_id) ->
    session_id = utils.randomString(session_length) unless session_id.length == session_length
    socket.ss.session_id = session_id
    SS.connected.sessions[session_id] = socket
    send socket, 'client:init', {id: true}


# PRIVATE

# All incoming requests go through here first
preProcess = (socket, cb) ->
  
  # Disconnect the client if limiter is enabled and requests-per-second have been exceeded
  @disconnect() if limiter and limiter.exceeded(socket)

  cb true

# Send a request or command to the back-end servers and deliver the response back through the correct websocket
send = (socket, type, obj = {}) ->

  # Append the command type and session_id to the outgoing message
  obj.type = type
  obj.session_id = socket.ss.session_id

  # If we expect a response
  if obj.id

    # Send via ZeroMQ, store the socket and original request ID
    zmqs.send obj, [socket, obj.id], (result, store) ->
      
      # Replace the ZeroMQ request ID with the original callback ID (from the browser)
      [socket, result.id] = store
      
      # Send the message via the socket which requested it
      socket.emit obj.type, JSON.stringify(result)
  
  # If not, just send the command
  else
    zmqs.send obj
