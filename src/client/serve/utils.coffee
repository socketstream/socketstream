# Client Asset Serving Shared Utils

exports.serve =

  js:  (body, response) ->
    serve(body, 'text/javascript; charset=utf-8', response)

  css: (body, response) ->
    serve(body, 'text/css', response)

exports.parseUrl = (url) ->
  cleanUrl = url.split('&')[0]
  cleanUrl.split('?')[1]


# Private

serve = (body, type, response) ->
  response.writeHead(200, {'Content-type': type, 'Content-Length': Buffer.byteLength(body)})
  response.end(body)
