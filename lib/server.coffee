http    = require 'http'
io      = require 'socket.io@0.6.8'
static  = require 'node-static@0.5.3'

log = null
self = {}

Session = require('./session').Session
Publish = require('./publish').Publish
$SS.publish = new Publish

Compiler = require('./compiler').Compiler
compiler = new Compiler

class exports.Server
  
  constructor: () ->
    self = @
    @controllers = {}
    if $SS.config.log_level and $SS.config.log_level > 0
      Logger = require('./logger.coffee').Logger
      log = new Logger($SS.config.log_level)
    
  start: ->
    @server = http.createServer(@_processHttpRequest)
    @socket = io.listen(@server, {transports: ['websocket', 'flashsocket']})
    @socket.on('connection', @_processNewConnection)
    @socket.on('clientMessage', @_processIncomingCall)
    @server.listen($SS.config.port)
    @_listenForPubSubEvents()
    @_showWelcomeMessage()
    
  _processHttpRequest: (request, response) ->
    respond_to = ['coffee', 'styl']
    file_extension = request.url.split('.').reverse()[0]
    if !$SS.config.pack_assets and respond_to.include(file_extension)
      compiler.fromURL request.url, (result) ->
        response.writeHead(200, {'Content-type': result.content_type, 'Content-Length': result.output.length})
        response.end(result.output)
    else
      file = new(static.Server)('./public')
      request.addListener('end', -> file.serve(request, response))
      log.staticFile(request) if log
      
  _processNewConnection: (client) ->
    client.remote = (method, params, type, options = {}) ->
      message = {method: method, params: params, cb_id: method.cb_id, callee: method.callee, type: type}
      client.send(JSON.stringify(message))
      log.outgoingCall(client, method) if log and (type != 'system' and options and !options.silent)
  
    client.session = new Session(client)
    client.session.process (session) ->
      if session.newly_created
        client.remote('setSession', session.id, 'system')
        log.createNewSession(session) if log
      client.remote('ready', {}, 'system')
      
  _processIncomingCall: (data, client) ->
    return null unless client.session.id # drop all calls unless session is loaded
    msg = JSON.parse(data)
    
    if msg && msg.method
      action = msg.method.split('.')
      method = action.pop()
      if method.charAt(0) == '_'
        sys.log "Error: Unable to access private method #{method}"
      else
        path = "#{$SS.root}/app/server/#{action.join('/')}"
        klass_name = action.pop().capitalized()
        try
          klass = require(path)[klass_name]
        catch e
          sys.log 'Error: Unable to find class ' + klass_name + ' or error in file'
          throw e if NODE_ENV == 'development'
          console.error(e)
          
        # Inject 'helper functions'
        obj = new klass
        obj.session = client.session
        obj.user = client.session.user

        args = []
        args.push(msg.params) if msg.params
        args.push((params, options) -> client.remote(msg, params, 'callback', options))
        
        try
          obj[method].apply(obj, args)
        catch e
          throw e if NODE_ENV == 'development'
          console.error(e)
        
        log.incomingCall(msg, client) if log and !(msg.options && msg.options.silent)
    else
      sys.log "Invalid message: #{data}"

  _listenForPubSubEvents: ->
    RPS.on 'message', (channel, message) =>
      channel = channel.split(':')
      if channel && channel[0] == 'socketstream'
        switch channel[1]
          when 'user'
            client = $SS.connected_users[channel[2]]
            client.send(message) if client and client.connected
          when 'broadcast'
            @socket.broadcast(message)

  _showWelcomeMessage: ->
    sys.puts "\n"
    sys.puts "------------------------- SocketStream -------------------------"
    sys.puts "  Version #{$SS.version.join('.')} running in #{NODE_ENV}"
    sys.puts "  Running on Port #{$SS.config.port}, PID #{process.pid}"
    sys.puts "----------------------------------------------------------------"
    sys.puts "\n"

