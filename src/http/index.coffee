# HTTP Server
# -----------
# SocketStream does not concern itself with web servers. It simply provides a stack of Connect Middleware
# which can be used by the application in any way it wishes.

fs = require('fs')
pathlib = require('path')

# Note: Connect 2.0.0alpha1 is bundled within SocketStream for now until it's available on NPM
connect = require('../connect')
RedisStore = require('connect-redis')(connect)

Router = require('./router').Router
router = new Router

staticDirs = []

exports.init = (root) ->
  router:     router
  staticDirs: loadStaticDirs()
  middleware: middlewareStack(root)


# Private

middlewareStack = (root) ->
  console.log "tot!"
  connect()
  .use(connect.cookieParser('fkdfhdjkf'))
  .use(connect.session(
    cookie: { path: '/', httpOnly: false, maxAge: 14400000 }
    store: new RedisStore
  ))
  .use(eventMiddleware)
  .use(connect.static(root + '/client/static'))

eventMiddleware = (req, res, next) ->
  initialDir = req.url.split('/')[1]
  if staticDirs.indexOf(initialDir) >= 0
    next() # serve static asset
  else
    if !router.route(req.url, req, res)
      console.log 'router returned false'
      next()
    else
      console.log 'router returned true'

loadStaticDirs = ->
  path = pathlib.join(root, 'client/static')
  if pathlib.existsSync(path)
    staticDirs = fs.readdirSync(path)
