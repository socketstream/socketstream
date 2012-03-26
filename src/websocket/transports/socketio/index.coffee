# SocketIO Websocket Transport
# Alot of this code will be cleaned up and may change in the future

fs = require('fs')
qs = require('querystring')
socketio = require('socket.io')

utils = require('../../../utils/misc.js')

exports.init = (client, emitter, httpServer, config) ->

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
          clientIp = socket.manager.handshaken[socket.id].address.address
          meta = {socketId: socket.id, sessionId: socket.sessionId, clientIp: clientIp, transport: 'socketio'}
          emitter.emit type, content, meta, (data) ->
            socket.send(data)
        catch e
          console.log 'Invalid websocket message received:'.red, msg
      
      socket.emit('ready')

  # Send Socket.IO Client to browser
  socketioClient = fs.readFileSync(__dirname + '/client.min.js', 'utf8')
  client.assets.add('lib', 'socketio-client', socketioClient, {minified: true})

  # Send socketstream-transport module
  code = fs.readFileSync(__dirname + '/wrapper.' + (process.env['SS_DEV'] && 'coffee' || 'js'), 'utf8')
  client.assets.add('mod', 'socketstream-transport', code, {coffee: process.env['SS_DEV']})

  # Export API
  event: ->
    
    all: (msg) ->
      io.sockets.emit 'message', msg

    socketId: (id, msg, meta = null) ->
      if (socket = io.sockets.sockets[id])?
        socket.emit 'message', msg, meta
      else
        false



# Private

processSession = (socket) ->
  return true if socket.sessionId

  # Parse session ID from initial hankshake data
  try
    rawCookie = socket.handshake.headers.cookie
    cookie = qs.parse(rawCookie, '; ')
    sessionId = cookie['connect.sid'].split('.')[0]
    socket.sessionId = sessionId
  catch e
    console.log('Warning: connect.sid session cookie not detected. User may have cookies disabled or session cookie has expired')
    false



