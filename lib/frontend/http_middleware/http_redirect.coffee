# Middleware: HTTP Redirect
# --------------------------
# Redirects HTTP requests to HTTPS

server = require('../utils.coffee')

# Simply rewrites the same URL with https:// in front of it
module.exports = ->

  (request, response, next) ->

    old_url = 'http://' + request.headers.host + request.url
    new_url = 'https://' + SS.config.https.domain + request.url
    server.redirect request, response, new_url
    SS.log.serve.httpsRedirect old_url, new_url
