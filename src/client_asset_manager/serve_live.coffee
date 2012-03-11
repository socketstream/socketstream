# Serve Client Assets Live
# ------------------------
# Serves code to be loaded asynchronously and all code and other assets when running without calling ss.client.packAssets()

require('colors')
url = require('url')
qs = require('querystring')
pathlib = require('path')
magicPath = require('./magic_path')

exports.init = (router, ssClient, asset, initAppCode, packAssets) ->

  # Listen for requests to load code asynchronously
  # TODO: Implement caching of async code requests in production mode
  router.on '/_serveAsync/code?*', (request, response) ->
    path = parseUrl(request.url)
    dir = pathlib.join(root, 'client/code')
    files = magicPath.files(dir, [path])

    output = []
    files.forEach (file) ->
      asset.js file, {pathPrefix: path, compress: packAssets}, (js) ->
        output.push(js)
        if output.length == files.length # last file
          serve(output.join("\n"), 'text/javascript; charset=utf-8', response)


  # If we're not pre-packing assets (i.e. in dev mode) we need to respond to requests to all assets live
  unless packAssets

    # JAVASCRIPT

    # Listen for requests for the SocketStream browser client (which contains the lib required for the ws transport)
    router.on '/_serveDev/client?*', (request, response) ->
      ssClient.code (output) ->
        serve(output, 'text/javascript; charset=utf-8', response)

    # Listen for requests for application client code
    router.on '/_serveDev/code?*', (request, response) ->
      thisUrl = url.parse(request.url)
      params = qs.parse(thisUrl.query)
      path = parseUrl(request.url)
      asset.js path, {pathPrefix: params.pathPrefix, compress: false}, (output) ->
        serve(output, 'text/javascript; charset=utf-8', response)

    router.on '/_serveDev/start?*', (request, response) ->
      serve(initAppCode, 'text/javascript; charset=utf-8', response)

    # CSS

    # Listen for requests for CSS files
    router.on '/_serveDev/css?*', (request, response) ->
      path = parseUrl(request.url)
      asset.css path, {compress: false}, (output) ->
        serve(output, 'text/css', response)


# Private

serve = (body, type, response) ->
  response.writeHead(200, {'Content-type': type, 'Content-Length': Buffer.byteLength(body)})
  response.end(body)

parseUrl = (url) ->
  cleanUrl = url.split('&')[0]
  cleanUrl.split('?')[1]
