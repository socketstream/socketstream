http    = require 'http'
io      = require 'socket.io@0.6.1'
static  = require 'node-static@0.5.3'

log = null
self = {}

Session = require('./session').Session

class exports.Server
  
  constructor: () ->
    self = @
    @controllers = {}
    if SocketStream.config.log_level and SocketStream.config.log_level > 0
      Logger = require('./logger.coffee').Logger
      log = new Logger(SocketStream.config.log_level)
    
  start: ->
    @server = http.createServer(@_processHttpRequest)
    @socket = io.listen(@server, {transports: ['websocket', 'flashsocket']})
    @socket.on('connection', @_processNewConnection)
    @socket.on('clientMessage', @_processIncomingCall)
    @server.listen(SocketStream.config.port)
    @_showWelcomeMessage()
  
  _processHttpRequest: (request, response) ->
    return self._compileCoffeeScript(request, response) if NODE_ENV == 'development' and request.url.match(/\.coffee$/) 
    file = new(static.Server)('./public')
    request.addListener('end', -> file.serve(request, response))
    log.staticFile(request) if log
    
  _processNewConnection: (client) ->
    client.remote = (method, params, options = {}) ->
      message = {method: method, params: params, cb_id: method.cb_id, callee: method.callee}
      message.system = true if options.system
      client.send(JSON.stringify(message))
      log.outgoingCall(client, method) if log and (options and !options.system and !options.silent)
  
    client.session = new Session(client)
    client.session.process (err, session) ->
      if session.newly_created
        client.remote('setSession', session.id, {system: true})
        log.createNewSession(session) if log
      client.remote('ready', {}, {system: true})
  
  _processIncomingCall: (data, client) ->
    return null unless client.session.data # drop all calls unless session is loaded
    msg = JSON.parse(data)
    
    if msg && msg.method
      action = msg.method.split('.')
      method = action.pop()
      if method.charAt(0) == '_'
        sys.log "Error: Unable to access private method #{method}"
      else
        path = "#{SocketStream.root}/app/server/#{action.join('/')}"
        klass_name = action.pop().capitalized()
        try
          klass = require(path)[klass_name]
          obj = new klass
          obj.session = client.session
          obj.user = client.session.user
        
          args = []
          args.push(msg.params) if msg.params
          args.push((params, options) -> client.remote(msg, params, options))
          
          try
            obj[method].apply(obj, args)
          catch e
            sys.log 'Error: Unable apply method to class ' + method
            console.error(e)
        
        catch e
          sys.log 'Error: Unable to find class ' + klass_name
          console.error(e)
        
        log.incomingCall(msg, client) if log and !(msg.options && msg.options.silent)
    else
      sys.log "Invalid message: #{data}"
  
  _compileCoffeeScript: (request, response) ->
    request.addListener 'end', =>
      file = request.url.split('/')[2].split('.')[0]
      fs.readFile "#{SocketStream.root}/app/client/#{file}.coffee", 'utf8', (err, coffeescript) ->
        js = coffee.compile(coffeescript)
        response.writeHead(200, {'Content-type': 'text/javascript', 'Content-Length': js.length})
        response.end(js)

  _showWelcomeMessage: ->
    sys.puts "\n"
    sys.puts "------------------------- SocketStream -------------------------"
    sys.puts "  Version #{SocketStream.version.join('.')} running in #{NODE_ENV}"
    sys.puts "  Running on Port #{SocketStream.config.port}, PID #{process.pid}"
    sys.puts "----------------------------------------------------------------"
    sys.puts "\n"
