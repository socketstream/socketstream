# Middleware: Static Server
# -------------------------
# Serves static files from the /public dir using the node_static library

static = new(SS.libs.static.Server)('./public')

exports.isValidRequest = (request) ->
  true
  
exports.call = (request, response) ->
  static.serve(request, response)
  SS.log.serve.staticFile(request)
