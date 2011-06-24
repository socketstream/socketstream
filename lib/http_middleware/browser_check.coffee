# Middleware: Incompatible Browser Checker
# ----------------------------------------
# Serves an 'Incompatible Browser' page to browsers which don't support websockets

dir = 'static/incompatible_browsers'

fs = require('fs')
server = require('../utils/server.coffee')
static = new(SS.libs.static.Server)('./' + dir)

# Default message if no custom error file present
body = "<h1>Incompatible Browser</h1>
<p>Add a custom error message page to /#{dir}/index.html</p>"

exports.call = (request, response, next) ->

  if isValidRequest(request)

    fs.stat "#{SS.root}/#{dir}/index.html", (err) ->
      if err and err.code == 'ENOENT' # file doesn't exist
        server.deliver(response, 200, 'text/html', body)
      else
        static.serve(request, response)
        SS.log.serve.staticFile(request)
  else  
    next()


# PRIVATE METHODS

# Does this browser appear to be incompatible?
isValidRequest = (request) ->
  ua = request.headers['user-agent']

  # If Strict checking for browsers which have native websocket support
  if SS.config.browser_check.strict
  
    # Capture headless browsers (e.g. spiders) 
    return true unless ua?
  
    # Allow Chrome version 4 and above
    if ua.match(/Chrom(e|ium)/)
      re = new RegExp("Chrom(e|ium)/([0-9]{1,})")
      if re.exec(ua) != null
        version = parseFloat( RegExp.$2 )
        return false if version >= 4
        
    # Allow Safari version 5 and above
    if ua.match(/Safari/)
      re = new RegExp("Version/([0-9]{1,})")
      if re.exec(ua) != null
        version = parseFloat( RegExp.$1 )
        return false if version >= 5
    
    # Else show the Browser Incompatible page
    true

  # Otherwise don't show this page and let's hope the browser has flash installed!
  else
    false
