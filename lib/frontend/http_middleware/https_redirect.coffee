# Middleware: HTTPS Redirect
# --------------------------
# Redirects incorrect HTTPS sent to the wrong host to the correct host for the SSL certificate

server = require('../utils.coffee')

# Will automatically redirect requests to an incorrect domain to the correct one
module.exports = ->

  (request, response, next) ->

    if SS.config.https.enabled and hostsDiffer(request)
      # Redirect URL to correct host
      old_url = 'https://' + request.headers.host + request.url
      new_url = 'https://' + SS.config.https.domain + request.url
      server.redirect request, response, new_url
      SS.log.serve.httpsRedirect old_url, new_url
    else
      next()


# PRIVATE

hostsDiffer = (request) ->
  SS.config.https.domain and SS.config.https.ensure_domain and request.headers.host != SS.config.https.domain
