# Serve Assets in Development
# ---------------------------
# Serves all code and other assets when you DON'T call ss.client.packAssets()

url = require('url')
qs = require('querystring')

system = require('../system')
utils = require('./utils')

module.exports = (ss, router, options) ->

  asset = require('../asset')(ss, options)

  # JAVASCRIPT

  # Serve system libraries and modules
  router.on '/_serveDev/system?*', (request, response) ->
    utils.serve.js(system.serve.js(), response)

  # Listen for requests for application client code
  router.on '/_serveDev/code?*', (request, response) ->
    thisUrl = url.parse(request.url)
    params = qs.parse(thisUrl.query)
    path = utils.parseUrl(request.url)
    asset.js path, {pathPrefix: params.pathPrefix}, (output) ->
      utils.serve.js(output, response)

  router.on '/_serveDev/start?*', (request, response) ->
    utils.serve.js(system.serve.initCode(), response)

  # CSS

  # Listen for requests for CSS files
  router.on '/_serveDev/css?*', (request, response) ->
    path = utils.parseUrl(request.url)
    asset.css path, {}, (output) ->
      utils.serve.css(output, response)
