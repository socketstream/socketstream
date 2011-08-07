# Middleware: Asset Request Server
# --------------------------------
# Compiles and serves assets live in development mode (or whenever SS.config.pack_assets != true)

path = require('path')
util = require('util')
server = require('../utils.coffee')
assets = require('../asset')


module.exports = ->

  (request, response, next) ->

    if isValidRequest(request)
      file = urlToFile(request.ss.parsedURL)
      request.ss_benchmark_start = new Date
      try
        assets.compile[file.extension] file.name, (result) ->
          server.deliver(response, 200, result.content_type, result.output)
          benchmark_result = (new Date) - request.ss_benchmark_start
          SS.log.serve.compiled(file.name, benchmark_result)
      catch e
        server.showError(response, e)
    else
      next()


# PRIVATE

# Should we attempt to serve this request?
isValidRequest = (request) ->
  url = request.ss.parsedURL
  return true if url.isRoot or url.extension == 'styl'
  isValidScript(url)

# Parse incoming URL depending on file extension`
urlToFile = (url) ->
  if url.isRoot
    rootHTML()
  else if isValidScript(url)
    {name: "app/#{url.initialDir}/#{url.path}", extension: url.extension}
  else
    {name: url.path, extension: url.extension}

# Excludes lib_*.js asset files
isValidScript = (url) ->
  ['coffee', 'js'].include(url.extension) and assets.client_dirs.include(url.initialDir)

# Decide which file to serve as the root
# Note: this synchronous request only runs in developer mode
rootHTML = ->
  jadeExists = path.existsSync "#{SS.root}/app/views/app.jade"
  if jadeExists
    {name: 'app.jade', extension: 'jade'}
  else
    {name: 'app.html', extension: 'html'}