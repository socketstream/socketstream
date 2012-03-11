# SocketIO Websocket Transport
# Alot of this code will be cleaned up and may change in the future

fs = require('fs')
qs = require('querystring')
socketio = require('socket.io')
coffee = require('coffee-script') if process.env['SS_DEV']

utils = require('../../../utils/misc.js')

exports.init = (emitter, httpServer, config) ->

  io = socketio.listen(httpServer)

  # Set default log level. Can be overwritten using app config
  io.set 'log level', 1

  # Temporary fix for https://github.com/LearnBoost/socket.io/issues/777  REMOVE_BEFORE_0.3.0
  io.set('close timeout', 60*60*120)
  
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
          clientIp = socket.manager.handshaken[socket.id].address.address
          meta = {socketId: socket.id, sessionId: socket.sessionId, clientIp: clientIp, transport: 'socketio'}
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

    libs: ->
      fs.readFileSync(__dirname + '/client.min.js', 'utf8')

    code: ->
      ext = coffee? && 'coffee' || 'js'
      input = fs.readFileSync(__dirname + '/wrapper.' + ext, 'utf8')
      coffee? && coffee.compile(input) || input


# Private

processSession = (socket) ->
  return true if socket.sessionId

  # Parse session ID from initial hankshake data
  try
    rawCookie = socket.handshake.headers.cookie
    cookie = qs.parse(rawCookie)
    sessionId = cookie['connect.sid'].split('.')[0]
    socket.sessionId = sessionId
  catch e
    console.log('Warning: connect.sid session cookie not detected. User may have cookies disabled or session cookie has expired')
    false



