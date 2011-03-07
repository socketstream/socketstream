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

exports.start = ->
  asset.init()
  server = mainServer()
  socket = $SS.libs.io.listen(server, {transports: ['websocket', 'flashsocket']})
  socket.on('connection', processNewConnection)
  socket.on('clientMessage', processIncomingCall)
  server.listen($SS.config.port)
  listenForPubSubEvents(socket)


# PRIVATE

# HTTP  
processHttpRequest = (request, response) ->
  if $SS.config.api.enabled and api.isValidRequest(request)
    api.call(request, response)
  else if !$SS.config.pack_assets and asset.request.valid(request.url)
    asset.request.serve(request, response)
  else
    request.addListener 'end', ->
      static.serve(request, response)
      $SS.log.staticFile(request)

# Socket.IO
processNewConnection = (client) ->
  client.remote = (method, params, type, options = {}) ->
    message = {method: method, params: params, cb_id: method.cb_id, callee: method.callee, type: type}
    client.send(JSON.stringify(message))
    $SS.log.outgoing.socketio(client, method) if (type != 'system' and options and !options.silent)

  session.process client, (this_session) ->
    client.session = this_session
    if client.session.newly_created  
      client.remote('setSession', client.session.id, 'system')
      $SS.log.createNewSession(client.session)
    client.remote('setConfig', $SS.config.client, 'system')
    client.remote('ready', {}, 'system')
      
processIncomingCall = (data, client) ->
  return null unless client.session.id # drop all calls unless session is loaded
  try
    try
      msg = JSON.parse(data)
    catch e
      throw ['unable_to_parse_message', 'Unable to parse incoming websocket request']
    if msg && msg.method
      action_array = msg.method.split('.')
      Request.process action_array, msg.params, client.session, (params, options) ->
        client.remote(msg, params, 'callback', options)
      $SS.log.incoming.socketio(msg, client) if !(msg.options && msg.options.silent)
    else
      throw ['invalid_message', 'Invalid websocket call. No action supplied']
  catch e
    client.remote('error', e, 'system')
    $SS.log.error.exception(e)

# Redis Pub/Sub
listenForPubSubEvents = (socket) ->
  $SS.redis.pubsub.on 'message', (channel, message) =>
    channel = channel.split(':')
    if channel && channel[0] == 'socketstream'
      switch channel[1]
        when 'user'
          client = $SS.users.connected[channel[2]]
          return if client and client.connected
            $SS.log.outgoing.event("User #{message.user_id}", message)
            client.send(message)
          else
            null
        when 'broadcast'
          $SS.log.outgoing.event("Broadcast", message)
          socket.broadcast(message)

mainServer = ->
  if $SS.config.ssl.enabled
    https.createServer(ssl.options, processHttpRequest)
  else
    http.createServer(processHttpRequest)

ssl =

  options:
    key:  fs.readFileSync(__dirname + "/../ssl/key.pem")   # look for "#{$SS.root}/config/ssl/key.pem" in the future
    cert: fs.readFileSync(__dirname + "/../ssl/cert.pem")


