# Middleware: HTTP API
# --------------------
# Automatically makes all public methods within /app/server accessible over a HTTP request-based API
# This module will only be loaded if SS.config.api.enabled == true

# EXAMPLES:

# /api/app/square.json?5 is the same as calling SS.server.app.square(5) from the browser
# To see the output on screen type type .html instead of .json
# Pass objects in the query string: E.g. /api/user/add.json?name=Tom&age=21 is the same as SS.server.user.add({name: 'Tom', age: 21})
# Note: Make sure your application code casts strings into the type of value you're expecting when using the HTTP API

url_lib = require('url')

base64 = require('../../utils/base64.js')
server = require('../utils.coffee')

rpc = new (require('../../rpc/connection.coffee')).Client('api')


# Connect middleware handler
module.exports = ->

  (request, response, next) ->

    if request.ss.parsedURL.initialDir == SS.config.api.prefix
      url = url_lib.parse(request.url, true)
      path = url.pathname.split('.')
      action = path[0]
      actions = request.ss.parsedURL.actions

      # Show error if no method
      if actions.length <= 1
        server.showError(response, 'Please specify an API Method to call')
      # Or attempt to process request
      else
        process(request, response, url, actions)
    else
      next()


# PRIVATE

# Process an API Request
process = (request, response, url, actions) ->

  try
    params = parseParams(url)
    format = request.ss.parsedURL.extension || 'html'
      
    # Check format is supported
    throw 'Invalid output format. Supported formats: ' + formatters.keys().join(', ') unless formatters.keys().include(format)
    
    post_data = ''
    request.on 'data', (chunk) -> post_data += chunk.toString()
    request.on 'end', ->

      # Generate request for back end and send
      obj = {responder: 'server', method: actions.join('.'), params: params}
      obj.post = post_data if post_data.length > 0

      # Execute the request and deliver the response once it returns
      rpc.send obj, (result) ->
        reply(result, response, format)
    
  catch e
    server.showError(response, e)
    SS.log.error.exception(e)
        
# Formats and deliver the object
reply = (data, response, format) ->
  formatters[format](data, response)
  
# Attempts to make sense of the params passed in the query string
parseParams = (url) ->
  try
    if url.search
      if url.search.match('=')        # Test to see if we're trying to pass an object
        [url.query]
      else
        [url.search.split('?')[1]]      # Or just a string/number
    else
      null
  catch e
    throw new Error('Unable to parse params. Check syntax.')


### TODO: Fix this or replace it ###

# Authenticate. Only Basic Auth is supported at the moment, but this can and should run over HTTPs
authenticate = (request, response, actions, session, cb) ->
  mod_path = actions.slice(0,-1).join('.')
  if SS.internal.authenticate[mod_path]
    if request.headers.authorization
      
      auth = request.headers.authorization.split(' ')
      details = base64.decode(auth[1]).split(':')
      params = {}
      [params.username, params.password] = details

      # Try to authenticate user
      session.authenticate SS.config.api.auth.basic.module_name, params, (reply) ->
        if reply.success
          session.setUserId(reply.user_id)
          cb(true)
        else
          server.showError(response, 'Invalid username or password')
          cb(false)
      
    else
      response.writeHead(401, {'WWW-Authenticate': 'Basic realm="' + SS.config.api.auth.basic.realm + '"', 'Content-type': 'text/html'})
      response.end('Not authorized')
      cb(false)
  else
    cb(true) 


# Formats data for output
formatters =

  json: (data, response) ->
    out = if data.error then {error: data.error} else {result: data.result}
    server.deliver(response, 200, 'text/json', JSON.stringify(out))

  # TODO: improve with syntax highlighting
  html: (data, response) ->
    if data.error
      message = "<h4>#{data.error.code}</h4><p>#{data.error.message}</p>"
      server.showError(response, message)
    else
      server.deliver(response, 200, 'text/html', JSON.stringify(data.result))
    
  # TODO: add XML once we find a great lightweight object.toXML() library
