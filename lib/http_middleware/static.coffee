# Middleware: Static Server
# -------------------------
# Serves static files from the /public dir using the node_static library

static = new(SS.libs.static.Server)('./public')

exports.call = (request, response, next) ->
  static.serve(request, response)
  SS.log.serve.staticFile(request)
  # don't call next() as this should always be the last middleware in the chain
