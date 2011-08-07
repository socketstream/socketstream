# Server Utils

# Deliver output to screen
exports.deliver = (response, code, type, body) ->
  response.writeHead(code, {'Content-type': type, 'Content-Length': Buffer.byteLength(body)})
  response.end(body)

# Show and error on the screen. TODO: Log to exception handling system
exports.showError = (response, error) ->
  output = '<h1>SocketStream Server Error</h1>'
  output += "<style type=\"text/css\">
    body {
      font-family: Helvetica, sans-serif;
      margin: 20px;
    }
    h1 {
      font-size: 20px;
      color: aa0000;
    }
  </style>
  <pre>#{error}</pre>"
  exports.deliver(response, 500, 'text/html', output)

# Redirect a standard HTTP request
exports.redirect = (request, response, url) ->
  response.statusCode = 302
  response.setHeader("Location", url)
  response.end()
