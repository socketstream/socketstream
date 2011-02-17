# SocketStream HTTP API
# ---------------------
# The API automatically makes all public methods within /app/server accesible over HTTP

# EXAMPLES:
# /api/app/square.json?5 is the same as calling remote('app.square',5,cb) from the browser
# To see the output on screen type type .html instead of .json
# Pass objects in the query string: E.g. /api/user/add.json?name=Tom&age=21 is the same as remote('user.add',{name: 'Tom', age: 21},cb)
# Note: Make sure you cast strings into the type of value you're expecting when using the HTTP API

url_lib = require('url')
Request = require('./request')

exports.call = (request, response) ->
  url = url_lib.parse(request.url, true)
  new ApiRequest(url, response).process()

class ApiRequest
  
  constructor: (@url, @response) ->
    @errors = []
    @params = @_parseParams()
    path = @url.pathname.split('.')
    action = path[0]
    @format = path[1].toString().toLowerCase()
    @actions = action.split('/').slice(2)
    
  process: ->
    @_verify()
    if @errors.any()
      @_showErrors()
    else
      Request.process @actions, @params, null, null, (data, options) =>
        out = @formats[@format](data)
        @_deliver(200, out.content_type, out.output)
      $SS.sys.log.incoming.http(@actions, @params, @format)
  
  _verify: ->
    unless @formats.keys().include(@format)
      @errors.push('Invalid output format. Supported formats: ' + @formats.keys().join(', ')) 

  _deliver: (code, type, body) ->
    @response.writeHead(code, {'Content-type': type, 'Content-Length': body.length})
    @response.end(body)
  
  _showErrors: (message) ->
    output = '<h3>SocketStream API Error</h3>'
    output += @errors.join('<br/>')
    @_deliver(400, 'text/html', output)

  _parseParams: ->
    if @url.search
      # Test to see if we're passing an object
      if @url.search.match('=')
        @url.query
      # Or just a string/number
      else
        @url.search.split('?')[1]

  # Output Formats
  formats:

    json: (obj) ->
      output = JSON.stringify(obj)
      {output: output, content_type: 'text/json'}

    # TODO: improve with syntax highlighting
    html: (obj) ->
      output = JSON.stringify(obj)
      {output: output, content_type: 'text/html'}