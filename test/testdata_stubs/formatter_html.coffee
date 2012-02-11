# Plain HTML Formatter

fs = require('fs')

exports.init = ->

  extensions: ['html']
  assetType: 'html'
  contentType: 'text/html'

  compile: (path, options, cb) ->
    input = fs.readFileSync(path, 'utf8')
    cb(input)
