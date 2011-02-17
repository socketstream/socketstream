# API

url_lib = require('url')
Request = require('./request')

exports.call = (request, response) ->
  url = url_lib.parse(request.url, true)
  params = parseParams(url)
  path = url.pathname.split('.')
  action = path[0]
  output_format = path[1]
  action_array = action.split('/').slice(2)

  Request.process action_array, params, null, null, (data, options) ->
    out = output_filter[output_format](data)
    response.writeHead(200, {'Content-type': out.content_type, 'Content-Length': out.output.length})
    response.end(out.output)
  
  $SS.sys.log.incoming.http(action_array, params, output_format)


parseParams = (url) ->
  if url.search
    # Test to see if we're passing an object
    if url.search.match('=')
      url.query
    # Or just a string/number
    else
      url.search.split('?')[1]
  else
    undefined


output_filter =

  json: (obj) ->
    output = JSON.stringify(obj)
    {output: output, content_type: 'text/json'}

  # TODO: improve with syntax highlighting
  html: (obj) ->
    output = JSON.stringify(obj)
    {output: output, content_type: 'text/html'}