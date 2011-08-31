# Plug Sockets
# ------------
# Connect to external services (e.g. legacy Rails apps or high-speed Game Servers) using ZeroMQ sockets

zmq_async = require('./zmq_async.coffee')

exports.init = ->
  for name, details of SS.config.plug_sockets.plugs

    throw new Error("#{name} Plug Socket must specify a destination ZeroMQ socket with 'connect_to'") unless details.connect_to

    socket_type = details.socket_type || 'xreq'

    # If async callbacks are required
    if details.callbacks
      SS.plugs[name] = new zmq_async.Socket(socket_type, details.connect_to, details.serialization || 'json')
      SS.plugs[name].debug = true if details.debug

    # Else just open up a raw socket
    else 
      SS.plugs[name] = SS.internal.zmq.createSocket(socket_type)
      SS.plugs[name].connect(details.connect_to)

