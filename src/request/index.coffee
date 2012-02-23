# Request Processor
# -----------------
# Process incoming requests regardless of transport (e.g. websocket, HTTP, method call from console)

exports.init = (root, ss) ->
  responders:  require('./responders').init(root, ss)
