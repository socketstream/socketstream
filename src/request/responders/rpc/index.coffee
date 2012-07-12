# RPC Responder
# -------------
# Preloads all functions in /server/rpc recursively and executes them when 'rpc' messages come in

fs = require('fs')

module.exports = (responderId, config, ss) ->

  name = config && config.name || 'rpc'

  # Serve client code
  code = fs.readFileSync(__dirname + '/client.' + (process.env['SS_DEV'] && 'coffee' || 'js'), 'utf8')
  ss.client.send('mod', 'socketstream-rpc', code, {coffee: process.env['SS_DEV']})
  ss.client.send('code', 'init', "require('socketstream-rpc')(#{responderId}, {}, require('socketstream').send(#{responderId}));")

  # Return API
  name: name

  interfaces: (middleware) ->

    # Get request handler
    request = require('./request')(ss, middleware)

    # All RPC calls to be sent and received over the websocket, encoding/decoding strings using JSON
    websocket: (msg, meta, send) ->

      # RPC responder uses JSON both ways
      msg = JSON.parse(msg)

      # Expand message fields so they're easier to work with
      req = 
        id:         msg.id
        method:     msg.m
        params:     msg.p
        socketId:   meta.socketId
        clientIp:   meta.clientIp
        sessionId:  meta.sessionId
        transport:  meta.transport
        receivedAt: Date.now()

      msgLogName = "rpc:#{req.id}".grey

      # Log incoming request
      ss.log('↪'.cyan, msgLogName, req.method)

      # Send any error stack traces back to the client if the request is local
      handleError = (e) ->
        message = (meta.clientIp == '127.0.0.1') && e.stack || 'See server-side logs'
        obj = {id: req.id, e: {message: message}}
        ss.log('↩'.red, msgLogName, req.method, e.message.red)
        ss.log(e.stack.split("\n").splice(1).join("\n")) if e.stack
        send(JSON.stringify(obj))

      # Process request
      try
        request req, (err, response) ->
          return handleError(err) if err
          obj = {id: req.id, p: response, e: req.error}
          timeTaken = Date.now() - req.receivedAt
          ss.log('↩'.green, msgLogName, req.method, "(#{timeTaken}ms)".grey)
          send(JSON.stringify(obj))
      catch e
        handleError(e)       


    # Experimental interface used by ss-console and server-side testing
    # Warning: This may change before we're happy for it to be used by all Request Responders
    internal: (args, meta, send) ->

      method = args[0]

      req = 
        id:         'internal'
        method:     method
        params:     args.splice(1)
        sessionId:  meta.sessionId
        transport:  meta.transport
        receivedAt: Date.now()
      
      request(req, send)
