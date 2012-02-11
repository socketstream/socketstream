# Websocket Middleware
# --------------------
# Allows incoming websocket requests to be pre-processed, transformed, or sent elsewhere

require('colors')
pathlib = require('path')
apiTree = require('apitree')

exports.init = (root, ss) ->

  customDir = pathlib.join(root, 'server/middleware')

  # Load internal middleware
  internal = require('./internal').init(root, ss)
  
  # Return API
  load: -> 
    stack = apiTree.createApiTree(customDir)    # Load custom middleware
    stack[k] = v for k, v of internal           # Append internal/default middleware
    stack
