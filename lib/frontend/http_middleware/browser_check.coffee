# Middleware: Incompatible Browser Checker
# ----------------------------------------
# Serves an 'Incompatible Browser' page to browsers which don't support websockets

fs = require('fs')
jade = require('jade')
server = require('../utils.coffee')

file_name = SS.root + '/app/views/' + SS.config.browser_check.view_name

# Default message if no custom error file present
fallback_content = "<h1>Incompatible Browser</h1>
<p>Add a custom error message page to /app/views/#{file_name}.jade (or .html)</p>"

module.exports = ->

  (request, response, next) ->

    return next() unless browserIsIncompatible(request)
    
    # This mess will be cleaned up in the future (hopefully 0.3) with a new client asset server
    fs.stat file_name + '.jade', (err) ->
      if err and err.code == 'ENOENT'
        fs.readFile file_name + '.html','utf8', (err, html) ->
          server.deliver(response, 200, 'text/html', html || fallback_content)
      else
        jade.renderFile file_name + '.jade', (err, html) ->
          server.deliver(response, 200, 'text/html', html)
      
# PRIVATE METHODS

browserIsIncompatible = (request) ->
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

    # Allow Firefox version 6 and above
    if ua.match(/Firefox/)
      re = new RegExp("Firefox/([0-9]{1,})")
      if re.exec(ua) != null
        version = parseFloat( RegExp.$1 )
        return false if version >= 6
    
    # Mac OS X Dashboard Web Clip  
    return false if ua.match(/WebClip/)
    # TODO - find out what version of AppleWebKit (~ 533) implemented websockets, 
    # will allow for greater refactoring of code above.    
    
    # Else show the Browser Incompatible page
    true

  # Otherwise don't show this page and let's hope the browser has flash installed!
  else
    false
