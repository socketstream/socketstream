# Plain HTML Formatter

fs = require('fs')

exports.init = ->

  extensions: ['html']
  assetType: 'html'
  contentType: 'text/html'

  compile: (path, options, cb) ->

    input = fs.readFileSync(path, 'utf8')

    # If passing optional headers for main view
    input = input.replace('<SocketStream>', options.headers) if options && options.headers

    cb(input)