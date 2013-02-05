# Serve Assets On Demand
# ----------------------
# Serves assets to browsers on demand, caching responses in production mode

require('colors')
pathlib = require('path')
magicPath = require('../magic_path')
utils = require('./utils')

# When packing assets, cache responses to each query in RAM to avoid
# having to re-compile and minify assets. TODO: Add limits/purging
queryCache = {}

module.exports = (ss, router, options) ->

  asset = require('../asset')(ss, options)

  serve = (processor) ->
    (request, response) ->
      path = utils.parseUrl(request.url)
      if options.packAssets && queryCache[path]
        utils.serve.js(queryCache[path], response)
      else
        processor request, response, path, (output) ->
          queryCache[path] = output
          utils.serve.js(output, response)

  # Async Code Loading
  code = (request, response, path, cb) ->
    output = []
    dir = pathlib.join(ss.root, options.dirs.code)
    files = magicPath.files(dir, [path])
    files.forEach (file) ->
      try
        asset.js file, {pathPrefix: path, compress: options.packAssets}, (js) ->
          output.push(js)
          if output.length == files.length # last file
            cb(output.join("\n"))
      catch e
        description = e.stack && e.stack.split("\n")[0] || 'Unknown Error'
        ss.log("! Unable to load #{file} on demand:".red, description)
        

  # Web Workers
  worker = (request, response, path, cb) ->
    asset.worker(path, {compress: options.packAssets}, cb)

  # Bind to routes
  router.on('/_serve/code?*', serve(code))
  router.on('/_serve/worker?*', serve(worker))
 