# SocketIO Websocket Transport
# A lot of this code will be cleaned up and may change in the future

fs = require('fs')
qs = require('querystring')
socketio = require('socket.io')

utils = require('../../../utils/misc.js')

module.exports = (ss, emitter, httpServer, config = {}) ->

  config.client = config.client || {}

  # Alias config.io to config.server to ensure we don't break apps using the old API
  if config.io? then config.server = config.io

  # Bind Socket.IO to the HTTP server
  io = socketio.listen(httpServer)

  # Set default log level. Can be overwritten using app config
  io.set 'log level', 1

  # Allow app to configure Socket.IO using the syntax below
  # ss.ws.transport.use('socketio', {io: function(io){
  #   io.set('log_level', 4)
  # }})
  config.server(io) if config.server
  
  # Listen out for new connections
  io.sockets.on 'connection', (socket) ->

    if processSession(socket)

      socket.on 'message', (msg) ->
        try
          [responderId, content] = utils.parseWsMessage(msg)
          clientIp = socket.manager.handshaken[socket.id].address.address
          meta = {socketId: socket.id, sessionId: socket.sessionId, clientIp: clientIp, transport: 'socketio'}
          emitter.emit responderId, content, meta, (data) ->
            socket.send(responderId + '|' + data)
        catch e
          console.log('Invalid websocket message received:'.red, msg)

      socket.emit('ready')

  # Send Socket.IO Client to browser
  socketioClient = fs.readFileSync(__dirname + '/client.min.js', 'utf8')
  ss.client.send('lib', 'socketio-client', socketioClient, {minified: true})

  # Send socketstream-transport module
  code = fs.readFileSync(__dirname + '/wrapper.' + (process.env['SS_DEV'] && 'coffee' || 'js'), 'utf8')
  ss.client.send('mod', 'socketstream-transport', code, {coffee: process.env['SS_DEV']})

  # Tell the SocketStream client to use this transport, passing any client-side config along to the wrapper
  ss.client.send('code', 'transport', "require('socketstream').assignTransport(" + JSON.stringify(config.client) + ");");


  # Export API
  event: ->

    all: (msg) ->
      io.sockets.emit('message', '0|' + msg)

    socketId: (id, msg, meta = null) ->
      if (socket = io.sockets.sockets[id])?
        socket.emit('message', '0|' + msg, meta)
      else
        false



# Private

processSession = (socket) ->
  return true if socket.sessionId

  # Parse session ID from initial handshake data
  try
    rawCookie = socket.handshake.headers.cookie
    cookie = qs.parse(rawCookie, '; ')
    sessionId = cookie['connect.sid'].split('.')[0]
    unsignedSessionId = sessionId.split(':')[1].replace(/\s/g, '+') # convert spaces to + 
    socket.sessionId = unsignedSessionId
  catch e
    console.log('Warning: connect.sid session cookie not detected. User may have cookies disabled or session cookie has expired')
    false



