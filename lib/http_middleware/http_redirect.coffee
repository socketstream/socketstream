# Middleware: HTTP Redirect
# --------------------------
# Redirects HTTP requests to HTTPS

server = require('../utils/server.coffee')

exports.call = (request, response, next) ->  
  old_url = 'http://' + request.headers.host + request.url
  new_url = 'https://' + SS.config.https.domain + request.url
  server.redirect request, response, new_url
  SS.log.serve.httpsRedirect old_url, new_url
