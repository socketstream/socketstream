http    = require 'http'
io      = require 'socket.io@0.6.8'
static  = require 'node-static@0.5.3'

log = null
self = {}

Session = require('./session').Session
Publish = require('./publish').Publish
$SS.publish = new Publish

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
    return self._compileCoffeeScript(request, response) if NODE_ENV == 'development' and request.url.match(/\.coffee$/) 
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
    return null if @_validateIncomingCallData(JSON.parse(data), client) is null 
    methodClass     = validation[0] 
    methodFunction  = validation[1]
    msg             = validation[2]

    path = "#{$SS.root}/app/server/#{methodClass.join('/')}"
    klass_name = methodFunction.capitalized()
    try
      klass = require(path)[klass_name]
    catch e
      sys.log 'Error: Unable to find class ' + klass_name
      console.error(e)
      
    # Inject 'helper functions'
    obj = new klass
    obj.session = client.session
    obj.user = client.session.user

    args = []
    args.push(msg.params) if msg.params
    args.push((params, options) -> client.remote(msg, params, 'callback', options))
    
    if NODE_ENV == 'development'
      obj[method].apply(obj, args) # We need to see full stack trace on screen
    else
      try
        obj[method].apply(obj, args)
      catch e
        # TODO: Catch and handle exceptions nicely without crashing server
        console.error(e)
    
    log.incomingCall(msg, client) if log and !(msg.options && msg.options.silent)

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
  
  _compileCoffeeScript: (request, response) ->
    request.addListener 'end', =>
      file = request.url.split('/')[2].split('.')[0]
      fs.readFile "#{$SS.root}/app/client/#{file}.coffee", 'utf8', (err, coffeescript) ->
        js = coffee.compile(coffeescript)
        response.writeHead(200, {'Content-type': 'text/javascript', 'Content-Length': js.length})
        response.end(js)

  _showWelcomeMessage: ->
    sys.puts "\n"
    sys.puts "------------------------- SocketStream -------------------------"
    sys.puts "  Version #{$SS.version.join('.')} running in #{NODE_ENV}"
    sys.puts "  Running on Port #{$SS.config.port}, PID #{process.pid}"
    sys.puts "----------------------------------------------------------------"
    sys.puts "\n"

  # This handles all the validations required. If all is fine, it returns an array of objects, otherwise it returns null. Still ugly
  _validateIncomingCallData: (msg, client) ->
    
    return null unless client.session.id # drop all calls unless session is loaded
    if msg and msg.method
      if msg.method.match(/\w+\.\w+/) is null # Make sure that the message method looks like 'class.function'
        console.error "Invalid argument called on remote: #{msg.method}. Please call like this: class.function"
        return null
      else 
        methodClass    = msg.method.split('.')[0]
        methodFunction = msg.method.split('.')[1]
        if methodFunction.charAt(0) == '_' # Someone is trying to call a private method, err!
          sys.log "Error: Unable to access private method #{methodFunction}. You can make the method public by removing the _"
          return null
        else
          return [methodClass, methodFunction, msg]
    else
      sys.log "Invalid message: #{data}"
    