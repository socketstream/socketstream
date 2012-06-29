# Request Middleware
# ------------------
# Allows incoming requests to be pre-processed, transformed, or sent elsewhere

pathlib = require('path')
existslib = process.version.split('.')[1] == '6' && require('path') || require('fs')
loadApiTree = require('../../utils/apiTree').loadApiTree

module.exports = (ss, config) ->

  customDir = pathlib.join(ss.root, 'server/middleware')

  # Load internal middleware
  internal = require('./internal')(ss)
  
  # Return API
  load: ->
    # Load custom middleware
    stack = existslib.existsSync(customDir) && loadApiTree(customDir) || {}

    # Append internal/default middleware
    stack[k] = v for k, v of internal
    stack
