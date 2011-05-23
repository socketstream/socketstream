# Asset Request Server
# --------------------
# Compiles and serves assets live in development mode (or whenever SS.config.pack_assets != true)

util = require('util')

exports.init = (@assets) ->
  @

exports.request =
  
  isValidRequest: (request) ->
    url = request.parsedURL
    return true if url.isRoot or url.extension == 'styl'
    isValidScript(url)
  
  call: (request, response) ->
    file = urlToFile(request.parsedURL)
    request.ss_benchmark_start = new Date
    exports.assets.compile[file.extension] file.name, (result) ->
      response.writeHead(200, {'Content-type': result.content_type, 'Content-Length': result.output.length})
      response.end(result.output)
      benchmark_result = (new Date) - request.ss_benchmark_start
      SS.log.serve.compiled(file.name, benchmark_result)


# PRIVATE

# Parse incoming URL depending on file extension
urlToFile = (url) ->
  if url.isRoot
    {name: 'app.jade', extension: 'jade'}
  else if isValidScript(url)
    {name: "app/#{url.initialDir}/#{url.path}", extension: url.extension}
  else
    {name: url.path, extension: url.extension}

# Excludes lib_*.js asset files
isValidScript = (url) ->
  ['coffee', 'js'].include(url.extension) and exports.assets.client_dirs.include(url.initialDir)
