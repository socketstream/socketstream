# Middleware: Asset Request Server
# --------------------------------
# Compiles and serves assets live in development mode (or whenever SS.config.pack_assets != true)

util = require('util')
server = require('../../utils/server.coffee')
assets = require('../../asset')

exports.isValidRequest = (request) ->
  url = request.parsedURL
  return true if url.isRoot or url.extension == 'styl'
  isValidScript(url)
  
exports.call = (request, response) ->
  file = urlToFile(request.parsedURL)
  request.ss_benchmark_start = new Date
  try
    assets.compile[file.extension] file.name, (result) ->
      server.deliver(response, 200, result.content_type, result.output)
      benchmark_result = (new Date) - request.ss_benchmark_start
      SS.log.serve.compiled(file.name, benchmark_result)
  catch e
    server.showError(response, e)


# PRIVATE

# Parse incoming URL depending on file extension`
urlToFile = (url) ->
  if url.isRoot
    {name: 'app.jade', extension: 'jade'}
  else if isValidScript(url)
    {name: "app/#{url.initialDir}/#{url.path}", extension: url.extension}
  else
    {name: url.path, extension: url.extension}

# Excludes lib_*.js asset files
isValidScript = (url) ->
  ['coffee', 'js'].include(url.extension) and assets.client_dirs.include(url.initialDir)
