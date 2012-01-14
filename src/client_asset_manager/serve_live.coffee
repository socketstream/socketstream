# Serve Client Assets Live
# ------------------------
# Typically used when developing your app. If you call ss.client.packAssets() this code will not be run

require('colors')
url = require('url')

exports.init = (router, ssClient, asset) ->

  # JAVASCRIPT

  # Listen for requests for the SocketStream browser client (which contains the lib required for the ws transport)
  router.on '/_dev/client?*', (request, response) ->
    ssClient.code (output) ->
      serve(output, 'text/javascript; charset=utf-8', response)

  # Listen for requests for application client code
  router.on '/_dev/code?*', (request, response) ->
    path = parseUrl(request.url)
    asset.js path, {compess: false}, (output) ->
      serve(output, 'text/javascript; charset=utf-8', response)

  # CSS

  # Listen for requests for CSS files
  router.on '/_dev/css?*', (request, response) ->
    path = parseUrl(request.url)
    asset.css path, {compess: false}, (output) ->
      serve(output, 'text/css', response)


# Private

serve = (body, type, response) ->
  response.writeHead(200, {'Content-type': type, 'Content-Length': Buffer.byteLength(body)})
  response.end(body)

parseUrl = (url) ->
  cleanUrl = url.split('&')[0]
  cleanUrl.split('?')[1]
