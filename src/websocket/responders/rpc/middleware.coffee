# Inbuilt middleware for RPC calls

require('colors')
pathlib = require('path')
apiTree = require('apitree')

exports.init = (root, session, ss) ->

  dir = pathlib.join(root, 'server/rpc/middleware')

  inbuilt =

    debug: ->
      (request, response, next) ->
        console.log "Debug incoming message >>\n".yellow, request
        next()

    loadSession: (options = {}) ->
      (request, response, next) ->
        if request.sessionId
          session.findOrCreate request.sessionId, request.socketId, (thisSession) ->
            request.session = thisSession
            console.log("Debug session >>\n".yellow, thisSession._store) if options.debug?
            next()
        else
          throw new Error('Cannot load session. Request does not contin a sessionId')

  # Load custom middleware
  middleware = apiTree.createApiTree(dir)

  # Append default
  middleware[k] = v for k, v of inbuilt

  middleware
