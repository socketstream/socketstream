# HTTP API
# --------
# Automatically makes all public methods within /app/server accesible over a HTTP request-based API

# EXAMPLES:

# /api/app/square.json?5 is the same as calling remote('app.square', 5, console.log) from the browser
# To see the output on screen type type .html instead of .json
# Pass objects in the query string: E.g. /api/user/add.json?name=Tom&age=21 is the same as remote('user.add',{name: 'Tom', age: 21},cb)
# Note: Make sure your application code casts strings into the type of value you're expecting when using the HTTP API

url_lib = require('url')
Session = require('../session.coffee').Session
Request = require('../request.coffee')
RTM = require('../realtime_models')
base64 = require('../utils/base64.js')

exports.isValidRequest = (request) ->
  request.url.split('/')[1].toLowerCase() == $SS.config.api.prefix

exports.call = (request, response) ->
  url = url_lib.parse(request.url, true)
  path = url.pathname.split('.')
  action = path[0]
  actions = action.split('/').slice(2)

  # Browse API if viewing root
  if actions.length <= 1
    deliver(response, 200, 'text/html', 'Browse public API. Coming soon.')
  # Or attempt to process request
  else
    process(request, response, url, path, actions)


# PRIVATE


# Process an API Request
process = (request, response, url, path, actions) ->

  # Create new session instance. This won't be stored in Redis as no client object is passed
  session = new Session
  
  try
    params = parseParams(url)  
    format = parseFormat(path)

    # Rest is highly experimental / testing
    if actions[0] == '_rest'
      actions = actions.slice(1) # remove prefix
      RTM.rest.processRequest actions, params, request, format, (data) -> reply(data, response, format)
      $SS.log.incoming.rest(actions, params, format, request.method)
  
    # Serve regular request to /app/server
    else
      authenticate request, response, actions, session, (success) ->
        if success
          Request.process actions, params, session, (data, options) -> reply(data, response, format)
          $SS.log.incoming.api(actions, params, format)
  catch e
    showError(response, e)
        
# Formats and deliver the object
reply = (data, response, format) ->
  out = output_formats[format](data)
  deliver(response, 200, out.content_type, out.output)

# Deliver output to screen
deliver = (response, code, type, body) ->
  response.writeHead(code, {'Content-type': type, 'Content-Length': body.length})
  response.end(body)

# Show and error on the screen. TODO: Log to exception handling system
showError = (response, error) ->
  output = '<h3>SocketStream API Error</h3>'
  output += error[1]
  deliver(response, 400, 'text/html', output)
  $SS.log.error.exception(error)

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

# Attempts to work out the output format requested and ensures it's valid. Default to HTML so we can see output on screen
parseFormat = (path) ->
  return 'html' unless path[1]
  format = path[1].toString().toLowerCase()
  unless output_formats.keys().include(format)
    showError(@response, ['invalid_output_format', 'Invalid output format. Supported formats: ' + output_formats.keys().join(', ')])
  format

# Authenticate. Only Basic Auth is supported at the moment, but this can and should run over HTTPs
authenticate = (request, response, actions, session, cb) ->
  mod_path = actions.slice(0,-1).join('.')
  if $SS.internal.authenticate[mod_path]
    if request.headers.authorization
      
      auth = request.headers.authorization.split(' ')
      details = base64.decode(auth[1]).split(':')
      params = {username: details[0], password: details[1]}

      # Try to authenticate user
      session.authenticate $SS.config.api.auth.basic.module_name, params, (reply) ->
        if reply.success
          session.setUserId(reply.user_id)
          cb(true)
        else
          showError(response, ['api_invalid_credentials', 'Invalid username or password'])
          cb(false)
      
    else
      response.writeHead(401, {'WWW-Authenticate': 'Basic realm="' + $SS.config.api.auth.basic.realm + '"', 'Content-type': 'text/html'})
      response.end('Not authorized')
      cb(false)
  else
    cb(true) 


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
