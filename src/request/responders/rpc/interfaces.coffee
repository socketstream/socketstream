# RPC Server-side Interfaces
# --------------------------
# Exposes a number of interfaces which can be used to contact the request handler

exports.init = (request, messagePrefix) ->

  # The raw request handler
  raw: request

  # All RPC calls to be sent and received over the websocket, encoding/decoding strings using JSON
  websocket: (msg, meta, socket) ->

    # RPC responder uses JSON both ways
    msg = JSON.parse(msg)

    # Expand message fields so they're easier to work with
    req = 
      id:         msg.id
      method:     msg.m
      params:     msg.p
      socketId:   meta.socketId
      sessionId:  meta.sessionId
      transport:  meta.transport
      receivedAt: Date.now()

    msgLogName = "rpc:#{req.id}".grey

    # Response callback
    res = (err, response) ->

      if err
        obj = {id: req.id, e: {message: err.message}}
        console.log('→'.red, msgLogName, req.method, err.name.red)
      else
        obj = {id: req.id, p: response, e: req.error}
        timeTaken = Date.now() - req.receivedAt
        console.log('←'.green, msgLogName, req.method, "(#{timeTaken}ms)".grey)

      # Send response object over websocket
      msg = messagePrefix + '|'+ JSON.stringify(obj)
      socket(msg)

    # Log incoming request
    console.log('→'.cyan, msgLogName, req.method)

    request(req, res)
  
  # Used by console
  internal: (args, meta, res) ->

    method = args[0]

    req = 
      id:         'internal'
      method:     method
      params:     args.splice(1)
      sessionId:  meta.sessionId
      transport:  meta.transport
      receivedAt: Date.now()
    
    request(req, res)

