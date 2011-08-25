# ZeroMQ RPC Transport
# --------------------
# Used when running in muti-process and multi-host cluster mode

# Just JSON for now. Others will be supported in the future
serializer = require('../serializer.coffee')[SS.config.cluster.serialization]

class exports.Client

  connect: (name) ->
    @socket = SS.internal.zmq.createSocket('xreq')
    @socket.connect SS.config.cluster.sockets.fe_main

  send: (obj) ->
    msg = serializer.pack(obj)
    @socket.send msg

  listen: (cb) ->
    @socket.on 'message', (msg) =>
      try
        cb serializer.unpack(msg)
      catch e
        throw new Error("Invalid RPC message received over ZeroMQ. Unable to parse #{@format} message. Reason given: #{e.message}")


class exports.Server

  connect: ->
    @socket = SS.internal.zmq.createSocket('xrep')
    @socket.connect SS.config.cluster.sockets.be_main
  
  listen: (cb) ->
    @socket.on 'message', (e1, e2, msg) =>
      try
        obj = serializer.unpack(msg)
        cb obj, (result) =>
          msg = serializer.pack(result)
          @socket.send e1, e2, msg
      catch e
        throw new Error("Invalid RPC message received over ZeroMQ. Unable to parse #{@format} message. Reason given: #{e.message}")


class exports.Publisher

  connect: ->
    @socket = SS.internal.zmq.createSocket('pub')
    @socket.bindSync SS.config.cluster.sockets.fe_pub

  send: (msg_type, message) ->
    @socket.send 'event', msg_type, message


class exports.Subscriber

  connect: ->
    @socket = SS.internal.zmq.createSocket('sub')
    @socket.connect SS.config.cluster.sockets.fe_pub
    @socket.subscribe('event')

  listen: (cb) ->
    @socket.on 'message', (msg_type, event_type, message) ->
      cb event_type.toString(), message.toString()


