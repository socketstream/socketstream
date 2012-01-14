# HTTP Server
# -----------
# SocketStream does not concern itself with web servers. It simply provides a stack of Connect Middleware
# which can be used by the application in any way it wishes.

urllib = require('url')
pathlib = require('path')

# Note: Connect 2.0.0alpha1 is bundled within SocketStream for now until it's available on NPM
connect = require('../connect')

Router = require('./router').Router
router = new Router

exports.init = (root) ->
  router:     router
  middleware: middlewareStack(root)


# Private

middlewareStack = (root) ->
  connect()
  .use(connect.cookieParser('secret'))
  .use(connect.session({key: 'session_id', secret: 'SocketStream'}))
  .use(eventMiddleware)
  .use(connect.static(root + '/client/static'))

eventMiddleware = (req, res, next) ->
  url = urllib.parse(req.url)
  extension = pathlib.extname(url.pathname)
  extension = extension.substring(1) if extension
  if extension and req.url.substring(0,5) != '/_dev'
    next() # serve static asset
  else
    router.route(req.url, req, res)