# Plain HTML Formatter

fs = require('fs')

exports.init = ->

  extensions: ['const']
  assetType: 'html'
  contentType: 'text/html'

  compile: (path, options, cb) -> cb 'CONST'
