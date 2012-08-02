# Plain HTML Formatter

fs = require('fs')

exports.init = ->

  extensions: ['html']
  assetType: 'html'
  contentType: 'text/html'

  compile: (path, options, cb) ->

    input = fs.readFileSync(path, 'utf8')

    # If passing optional headers for main view
    if options && options.headers
      input = input.replace('<SocketStream>', options.headers)
      input = input.replace('<SocketStream/>', options.headers)

    cb(input)
