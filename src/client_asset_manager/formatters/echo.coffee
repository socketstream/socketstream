# Plain HTML Formatter

fs = require('fs')

exports.init = ->

  extensions: []
  assetType: null

  compile: (path, options, cb) ->
    input = fs.readFileSync(path, 'utf8')
    cb(input)
