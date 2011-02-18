# HTTP API
# --------

# Automatically makes all public methods within /app/server accesible over a HTTP API

# EXAMPLES:

# /api/app/square.json?5 is the same as calling remote('app.square',5,cb) from the browser
# To see the output on screen type type .html instead of .json
# Pass objects in the query string: E.g. /api/user/add.json?name=Tom&age=21 is the same as remote('user.add',{name: 'Tom', age: 21},cb)
# Note: Make sure you cast strings into the type of value you're expecting when using the HTTP API

url_lib = require('url')
Request = require('./request')

exports.isValidRequest = (request) ->
  request.url.split('/')[1].toLowerCase() == $SS.config.api.prefix

exports.call = (request, response) ->
  url = url_lib.parse(request.url, true)
  path = url.pathname.split('.')
  action = path[0]
  actions = action.split('/').slice(2)

  # Browse API if viewing root
  if actions.length == 1
    deliver(response, 200, 'text/html', 'Browse public API. Coming soon.')
  # Or attempt to process request
  else
    process(response, url, path, actions)

# Process an API Request
process = (response, url, path, actions) ->
  try
    params = parseParams(url)  
    format = parseFormat(path)
  
    Request.process actions, params, null, null, (data, options) =>
      out = output_formats[format](data)
      deliver(response, 200, out.content_type, out.output)
    $SS.sys.log.incoming.http(actions, params, format)
  catch e
    showError(response, e)

# Deliver output to screen
deliver = (response, code, type, body) ->
  response.writeHead(code, {'Content-type': type, 'Content-Length': body.length})
  response.end(body)

# Show and error on the screen. TODO: Log to exception handling system
showError = (response, error) ->
  output = '<h3>SocketStream API Error</h3>'
  output += error[1]
  deliver(response, 400, 'text/html', output)

# Attempts to make sense of the params passed in the query string
parseParams = (url) ->
  try
    if url.search
      if url.search.match('=')        # Test to see if we're trying to pass an object
        url.query
      else
        url.search.split('?')[1]      # Or just a string/number
    else
      undefined
  catch e
    throw ['invalid_params', 'Unable to parse params. Check syntax.']

# Attempts to work out the output format requested and ensures it's valid
parseFormat = (path) ->
  return 'html' unless path[1]
  format = path[1].toString().toLowerCase()
  unless output_formats.keys().include(format)
    throw ['invalid_output_format', 'Invalid output format. Supported formats: ' + output_formats.keys().join(', ')]
  format

# Formats data for output
output_formats =

  json: (data) ->
    output = JSON.stringify(data)
    {output: output, content_type: 'text/json'}

  # TODO: improve with syntax highlighting
  html: (data) ->
    output = JSON.stringify(data)
    {output: output, content_type: 'text/html'}
    
  # TODO: add XML once we find a great lightweight object.toXML() library