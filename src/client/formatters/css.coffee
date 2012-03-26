# Plain CSS Formatter

fs = require('fs')

exports.init = ->

  extensions: ['css']
  assetType: 'css'
  contentType: 'text/css'

  compile: (path, options, cb) ->
    cb fs.readFileSync(path, 'utf8')
