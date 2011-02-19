fs = require('fs')
util = require('util')
http = require('http')
#https = require('https')

Session = require('./session').Session
Request = require('./request')

api = require('./api')
static = new($SS.libs.static.Server)('./public')

class exports.Server

  start: ->
    @server = http.createServer(@_processHttpRequest)
    @socket = $SS.libs.io.listen(@server, {transports: ['websocket', 'flashsocket']})
    @socket.on('connection', @_processNewConnection)
    @socket.on('clientMessage', @_processIncomingCall)
    @server.listen($SS.config.port)
    @_listenForPubSubEvents()
    showWelcomeMessage()
  
  _options: -> # for forthcoming HTTPS
    {
      key:  fs.readFileSync("#{$SS.root}/config/ssl/key.pem"),
      cert: fs.readFileSync("#{$SS.root}/config/ssl/cert.pem")      
    }


  # HTTP
  
  _processHttpRequest: (request, response) ->
    if $SS.config.api.enabled and api.isValidRequest(request)
      api.call(request, response)
    else if !$SS.config.pack_assets and $SS.sys.asset.request.valid(request.url)
      $SS.sys.asset.request.serve(request, response)
    else
      request.addListener 'end', ->
        static.serve(request, response)
        $SS.sys.log.staticFile(request)


  # Socket.IO

  _processNewConnection: (client) ->
    client.remote = (method, params, type, options = {}) ->
      message = {method: method, params: params, cb_id: method.cb_id, callee: method.callee, type: type}
      client.send(JSON.stringify(message))
      $SS.sys.log.outgoing.socketio(client, method) if (type != 'system' and options and !options.silent)
  
    client.session = new Session(client)
    client.session.process (session) ->
      if session.newly_created  
        client.remote('setSession', session.id, 'system')
        $SS.sys.log.createNewSession(session)
      client.remote('setConfig', $SS.config.client, 'system')
      client.remote('ready', {}, 'system')
      
  _processIncomingCall: (data, client) ->
    return null unless client.session.id # drop all calls unless session is loaded
    msg = JSON.parse(data)
    if msg && msg.method
      action_array = msg.method.split('.')
      Request.process action_array, msg.params, client.session, client.session.user, (params, options) ->
        client.remote(msg, params, 'callback', options)
      $SS.sys.log.incoming.socketio(msg, client) if !(msg.options && msg.options.silent)
    else
      util.log "Invalid message: #{data}"
      
  
  # Redis Pub/Sub

  _listenForPubSubEvents: ->
    $SS.redis.pubsub.on 'message', (channel, message) =>
      channel = channel.split(':')
      if channel && channel[0] == 'socketstream'
        switch channel[1]
          when 'user'
            client = $SS.users.connected[channel[2]]
            return if client and client.connected
              client.send(message)
            else
              null
          when 'broadcast'
            @socket.broadcast(message)


showWelcomeMessage = ->
  util.puts "\n"
  util.puts "------------------------- SocketStream -------------------------"
  util.puts "  Version #{$SS.version.join('.')} running in #{$SS.env}"
  util.puts "  Running on Port #{$SS.config.port} | PID #{process.pid} | Startup time #{(new Date) - $SS.internal.up_since}ms"
  util.puts "----------------------------------------------------------------"
  util.puts "\n"

