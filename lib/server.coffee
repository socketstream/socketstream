http    = require 'http'
#https   = require 'https'

self = {}
Session = require('./session').Session

class exports.Server
  
  constructor: () ->
    self = @
    @static_server = new($SS.libs.static.Server)('./public')
    
  start: ->
    @server = http.createServer(@_processHttpRequest)
    @socket = $SS.libs.io.listen(@server, {transports: ['websocket', 'flashsocket']})
    @socket.on('connection', @_processNewConnection)
    @socket.on('clientMessage', @_processIncomingCall)
    @server.listen($SS.config.port)
    @_listenForPubSubEvents()
    @_showWelcomeMessage()
  
  _options: -> # for forthcoming HTTPS
    {
      key:  fs.readFileSync("#{$SS.root}/config/ssl/key.pem"),
      cert: fs.readFileSync("#{$SS.root}/config/ssl/cert.pem")      
    }
    
  _processHttpRequest: (request, response) ->
    if !$SS.config.pack_assets and $SS.sys.asset.request.valid(request.url)
      $SS.sys.asset.request.serve(request, response)
    else
      request.addListener 'end', ->
        self.static_server.serve(request, response)
        $SS.sys.log.staticFile(request)
    
  _processNewConnection: (client) ->
    client.remote = (method, params, type, options = {}) ->
      message = {method: method, params: params, cb_id: method.cb_id, callee: method.callee, type: type}
      client.send(JSON.stringify(message))
      $SS.sys.log.outgoingCall(client, method) if (type != 'system' and options and !options.silent)
  
    client.session = new Session(client)
    client.session.process (session) ->
      if session.newly_created
        client.remote('setSession', session.id, 'system')
        $SS.sys.log.createNewSession(session)
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
          throw e if $SS.config.throw_errors
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
          throw e if $SS.config.throw_errors
          console.error(e)
        
        $SS.sys.log.incomingCall(msg, client) if !(msg.options && msg.options.silent)
    else
      sys.log "Invalid message: #{data}"

  _listenForPubSubEvents: ->
    RPS.on 'message', (channel, message) =>
      channel = channel.split(':')
      if channel && channel[0] == 'socketstream'
        switch channel[1]
          when 'user'
            client = $SS.connected_users[channel[2]]
            return if client and client.connected
              client.send(message)
            else
              null
          when 'broadcast'
            @socket.broadcast(message)
            
  _showWelcomeMessage: ->
    sys.puts "\n"
    sys.puts "------------------------- SocketStream -------------------------"
    sys.puts "  Version #{$SS.version.join('.')} running in #{$SS.env}"
    sys.puts "  Running on Port #{$SS.config.port}, PID #{process.pid}"
    sys.puts "----------------------------------------------------------------"
    sys.puts "\n"

