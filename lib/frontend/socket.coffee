# Sockets
# -------
# Handles incoming web/flash socket clients from Socket.IO

utils = require('../utils')
zmqs = new (require('../zmq_async.coffee').Socket)
zmqs.internal = true
zmqs.debug = false

session_length = 32

# Load optional modules
limiter = require('./limiter.coffee') if SS.config.limiter.enabled

# Called when a Socket.IO client establishes a connection to the server for the first time
exports.connection = (socket) ->

  # Define our own namespace to store stuff in
  socket.ss = {}


  # Called when a Socket.IO client disconnects (e.g. user shuts down the browser window, connection times out or RPS limit exceeded)
  socket.on 'disconnect', (reason) ->
    try
      delete SS.internal.sessions[socket.ss.session.id]
      zmqSend socket, {responder: 'client', method: 'disconnect'}


  ### DEFINE INCOMING MESSAGE HANDLERS ###

  # Handle incoming calls to SS.server code
  socket.on 'server', (msg, cb) ->
    preProcess socket, ->
      msg.responder = 'server'
      request = zmqSend socket, msg, (response) ->
        
        # If session has been updated during the request, the deltas will be sent back
        if response.session_updates?
          socket.ss.session[field] = value for field, value of response.session_updates
          delete response.session_updates

        # Send the raw message, minus any session_updates back over the websocket
        cb response

      SS.log.incoming.server(request, socket)
  
  # Handle incoming calls to Realtime Models. Highly experimental and switched off by default
  if SS.config.rtm.enabled
    socket.on 'rtm', (msg, cb) ->
      preProcess socket, ->
        msg.responder = 'rtm'
        request = zmqSend socket, msg, (response) -> cb(response.result)
        SS.log.incoming.rtm(request, socket)

  # Pass client heartbeats through to the back end
  socket.on 'heartbeat', ->
    zmqSend socket, {responder: 'client', method: 'heartbeat'}
  

  ### FINALLY, INITIATE SESSION ###

  # Get the existing session_id if we have one then transmit everything we need to the client
  
  socket.emit 'getSessionID', {}, (session_id) ->
    session_id = utils.randomString(session_length) unless session_id.length == session_length
    socket.ss.session = {id: session_id}
    SS.internal.sessions[session_id] = socket
    zmqSend socket, {responder: 'client', method: 'init'}, (response) ->
      result = response.result
      socket.ss.session = result.session
      socket.emit 'init', JSON.stringify(result.send_to_client)


# PRIVATE

# All incoming requests go through here first
preProcess = (socket, cb) ->
  
  # Disconnect the client if limiter is enabled and requests-per-second have been exceeded
  @disconnect() if limiter and limiter.exceeded(socket)

  cb true

# Send a request or command to the back-end servers and deliver the response back through the correct websocket
zmqSend = (socket, obj = {}, cb) ->

  # Send meta data with this request
  obj.session = socket.ss.session if socket.ss.session
  obj.origin = 'socketio'
  
  # Send via ZeroMQ, store the socket and original request ID
  zmqs.send obj, cb
