# Serve Assets On Demand
# ----------------------
# Serves assets to browsers on demand, caching responses in production mode

pathlib = require('path')
magicPath = require('../magic_path')
utils = require('./utils')

# When packing assets, cache responses to each query in RAM to avoid
# having to re-compile and minify assets. TODO: Add limits/purging
queryCache = {}

module.exports = (root, router, options) ->

  asset = require('../asset').init(root, options)

  serve = (processor) ->
    (request, response) ->
      if options.packAssets && queryCache[request.url]
        utils.serve.js(queryCache[request.url], response)
      else
        path = utils.parseUrl(request.url)
        processor request, response, path, (output) ->
          queryCache[request.url] = output
          utils.serve.js(output, response)

  # Async Code Loading
  code = (request, response, path, cb) ->
    output = []
    dir = pathlib.join(root, options.dirs.code)
    files = magicPath.files(dir, [path])
    files.forEach (file) ->
      asset.js file, {pathPrefix: path, compress: options.packAssets}, (js) ->
        output.push(js)
        if output.length == files.length # last file
          cb(output.join("\n"))

  # Web Workers
  worker = (request, response, path, cb) ->
    asset.worker(path, {compress: options.packAssets}, cb)

  # Bind to routes
  router.on('/_serve/code?*', serve(code))
  router.on('/_serve/worker?*', serve(worker))
 