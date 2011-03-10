# Asset Request Server
# --------------------
# Compiles and serves assets live in development mode (or whenever $SS.config.pack_assets != true)

util = require('util')

exports.init = (@assets) ->
  @

exports.request =
  
  responds_to:  ['coffee', 'styl']

  valid: (url) ->
    return true if isRoot(url)
    file_extension = url.split('.').reverse()[0]
    @responds_to.include(file_extension)
  
  serve: (request, response) ->
    file = parseURL(request.url)
    request.ss_benchmark_start = new Date
    exports.assets.compile[file.extension] file.name, (result) ->
      response.writeHead(200, {'Content-type': result.content_type, 'Content-Length': result.output.length})
      response.end(result.output)
      benchmark_result = (new Date) - request.ss_benchmark_start
      util.log("DEV INFO: Compiled and served #{file.name} in #{benchmark_result}ms")


# PRIVATE

# Parse incoming URL depending on file extension
parseURL = (url) ->
  extension = url.split('.').reverse()[0]
  path = url.split('/')
  dir = path[1]; file = path.splice(2)
  if isRoot(url)
    {name: 'app.jade', extension: 'jade'}
  else if extension == 'coffee' and exports.assets.client_dirs.include(dir)
    {name: "app/#{dir}/#{file.join('/')}", extension: extension}
  else
    {name: file, extension: extension}

# Determins if we're looking for the root of the site, ignoring any hashes or anything in the query string
isRoot = (url) ->
   u = url.split('?')[0].split('/')
   u.length == 2 and !u[1].match(/\./)
