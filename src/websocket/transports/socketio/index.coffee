# SocketIO Websocket Transport
# Alot of this code will be cleaned up and may change in the future

fs = require('fs')
socketio = require('socket.io')
coffee = require('coffee-script') if process.env['SS_DEV']

utils = require('../../../utils/misc.js')

exports.init = (emitter, httpServer, config) ->

  io = socketio.listen(httpServer)

  # Set default log level. Can be overwritten using app config
  io.set 'log level', 1
  
  # Allow app to configure Socket.IO using the syntax below
  # ss.ws.transport.use('socketio', {io: function(io){
  #   io.set('log_level', 4) 
  # }})
  config.io(io) if config?.io?

  # Listen out for new connections
  io.sockets.on 'connection', (socket) ->
 
    if processSession(socket)

      socket.on 'message', (msg) ->
        try
          [type, content] = utils.parseWsMessage(msg)
          meta = {socketId: socket.id, sessionId: socket.sessionId, transport: 'socketio'}
          emitter.emit type, content, meta, (data) ->
            socket.send(data)
        catch e
          console.log 'Invalid websocket message received:'.red, msg
      
      socket.emit('ready')


  event: ->
    
    all: (msg) ->
      io.sockets.emit 'message', msg

    socketId: (id, msg, meta = null) ->
      if (socket = io.sockets.sockets[id])?
        socket.emit 'message', msg, meta
      else
        false


  client: ->

    code: ->
      output = []

      # First load the stock Socket.IO Client
      output.push fs.readFileSync(__dirname + '/client.min.js', 'utf8')

      # Next add the transport wrapper
      ext = coffee? && 'coffee' || 'js'
      input = fs.readFileSync(__dirname + '/wrapper.' + ext, 'utf8')
      output.push coffee? && coffee.compile(input) || input

      # Concat and return all client code
      output.join(";\n")


# Private

processSession = (socket) ->
  return true if socket.sessionId

  # Parse session ID from initial hankshake data
  cookie = socket.handshake.headers.cookie
  if (i = cookie.indexOf('connect.sid')) >= 0
    socket.sessionId = cookie.substr(i+12, i+24)
  else
    console.error('Warning: connect.sid not detected in cookie')
    false

