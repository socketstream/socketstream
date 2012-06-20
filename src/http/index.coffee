# HTTP Server
# -----------
# SocketStream does not concern itself with web servers. It simply provides a stack of Connect Middleware
# which can be used by the application in any way it wishes.

fs = require('fs')
pathlib = require('path')
existslib = process.version.split('.')[1] == '6' && require('path') || require('fs')
connect = require('connect')

fileUtils = require('../utils/file')
router = new (require('./router').Router)

staticDirs = []
staticFiles = []

# User-configurable settings with sensible defaults
settings = 
  static: {maxAge: 30 * 24 * 60 * 60 * 1000}  # cache static assets in the browser for 30 days

# Create new Connect app instance which can be accessed from your app.js file with ss.http.middleware
app = connect()

# Alias app.use to indicate this will be added to the stack BEFORE SocketStream middleware
app.prepend = app.use

# Allow Connect middleware to be added AFTER SocketStream middleware has been added to the stack
useAfterStack = []

app.append = ->
  args = Array.prototype.slice.call(arguments)
  useAfterStack.push(args)


module.exports = (root) ->

  # Return API
  connect:    connect
  middleware: app
  router:     router


  # Merge optional settings
  set: (newSettings) ->
    throw new Error('ss.http.set() takes an object e.g. {static: {maxAge: 60000}}') unless typeof(newSettings) == 'object'
    settings[k] = v for k, v of newSettings

  load: (staticPath, sessionStore, sessionOptions) ->   
    staticPath = pathlib.join(root, staticPath)

    loadStaticDirs(staticPath)

    # Append SocketStream middleware upon server load
    app
    .use(connect.cookieParser('SocketStream'))
    .use(connect.favicon(staticPath + '/favicon.ico'))
    .use(connect.session(
      cookie: { path: '/', httpOnly: false, maxAge: sessionOptions.maxAge },
      store: sessionStore
    ))
    
    # Append any custom-defined middleware (e.g. everyauth)
    useAfterStack.forEach (m) -> app.use.apply(app, m)

    # Finally ensure static asset serving is last
    app
    .use(eventMiddleware)
    .use(connect.static(staticPath, settings.static))

    app

  # Expose short-form routing API
  route: (url, fn) ->
    if fn
      router.on(url, fn)
    else
      { 
        serveClient: (name) ->
          cb = (req, res) -> res.serveClient(name)
          router.on(url, cb) 
      }

# Private

eventMiddleware = (req, res, next) ->
  initialDir = req.url.split('/')[1]
  
  # Rewrite incoming URLs when serving dev assets live  
  req.url = transformURL(req.url) if initialDir == '_serveDev'

  # Serve a static asset if the URL starts with a static asset dir OR the router cannot find a matching route
  next() if staticDirs.indexOf(initialDir) >= 0 || !router.route(req.url, req, res)


# We do this in development mode ONLY to make it easier to identify which file has an error in Chrome, etc, by
# showing the real file name instead of 'code', without breaking the event-based routing system. Improvements welcome
# e.g. this function transforms "/serveDev/code/app.js?ts=12345" to "/serveDev/code?app.js&ts=12345"
transformURL = (url) ->
  i = 0
  i = url.indexOf('/',i+1) for x in [0..1]
  if url[i] == '/'
    url = url.replace('?','&')
    url = url.substr(0,i) + '?' + url.substr(i+1)
  url


loadStaticDirs = (path) ->
  if existslib.existsSync(path)

    # Get a list of top-level static directories (used by the router)
    staticDirs = fs.readdirSync(path)

    # Ensure /assets is always present, even if the dir has yet to be created
    staticDirs.push('assets') unless staticDirs.indexOf('assets') >= 0

    # Get a list of all static files we know about (used to prevent connect.session from loading unnecessarily)
    pathLength = path.length
    staticFiles = fileUtils.readDirSync(path).files
    staticFiles = staticFiles.map (file) -> file.substr(pathLength)
