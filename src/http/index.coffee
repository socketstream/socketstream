# HTTP Server
# -----------
# SocketStream does not concern itself with web servers. It simply provides a stack of Connect Middleware
# which can be used by the application in any way it wishes.

fs = require('fs')
pathlib = require('path')
fileUtils = require('../utils/file')
connect = require('../connect')  # Note: Connect 2.0.0alpha1 is bundled within SocketStream for now until it's available on NPM

router = new (require('./router').Router)

# Create new Connect app instance which can be accessed from your app.js file with ss.http.middleware
app = connect()

# Alias app.use to indicate this will be added to the stack BEFORE SocketStream middleware
app.prepend = app.use

# Allow Connect middleware to be added AFTER SocketStream middleware has been added to the stack
useAfterStack = []

app.append = ->
  args = Array.prototype.slice.call(arguments)
  useAfterStack.push(args)

staticDirs = []
staticFiles = []

exports.init = (root) ->

  staticPath = pathlib.join(root, 'client/static')

  loadStaticDirs(staticPath)

  # Return API
  connect:    connect
  middleware: app
  router:     router
  staticDirs: staticDirs

  load: (sessionStore, sessionOptions) ->
    # Append SocketStream middleware upon server load
    app
    .use(connect.cookieParser('SocketStream'))
    .use(connect.session(
      cookie: { path: '/', httpOnly: false, maxAge: sessionOptions.maxAge },
      store: sessionStore
    ))
    
    # Append any custom-defined middleware (e.g. everyauth)
    useAfterStack.forEach (m) -> app.use.apply(app, m)

    # Finally ensure static asset serving is last
    app
    .use(eventMiddleware)
    .use(connect.static(staticPath))

    # Prevent sessions from loading on requests for static assets
    # Not working yet as this functionality not present in Connect 2 yet as far as I can tell
    #connect.session.ignore = connect.session.ignore.concat(staticFiles)

    app


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
  if pathlib.existsSync(path)

    # Get a list of top-level static directories (used by the router)
    staticDirs = fs.readdirSync(path)

    # Ensure /assets is always present, even if the dir has yet to be created
    staticDirs.push('assets') unless staticDirs.indexOf('assets') >= 0

    # Get a list of all static files we know about (used to prevent connect.session from loading unnecessarily)
    pathLength = path.length
    staticFiles = fileUtils.readDirSync(path).files
    staticFiles = staticFiles.map (file) -> file.substr(pathLength)
