# Javascript formatter

fs = require('fs')

exports.init = ->

  extensions: ['js']
  assetType: 'js'
  contentType: 'text/javascript; charset=utf-8'

  compile: (path, options, cb) ->
    cb fs.readFileSync(path, 'utf8')