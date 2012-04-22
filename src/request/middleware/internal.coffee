# Internal Request Middleware
# ---------------------------
# Internal middleware occupies the top-level namespace, i.e. does not contain any dots

require('colors')

module.exports = (ss) ->

  session = require('../../session')

  debug: (color = 'yellow') ->
    (request, response, next) ->
      console.log("Debug incoming message >>\n"[color], request)
      next()

  session: (options = {}) ->
    (request, response, next) ->
      if request.sessionId
        session.find request.sessionId, request.socketId, (thisSession) ->
          request.session = thisSession
          console.log("Debug session >>\n".yellow, thisSession) if options.debug?
          if thisSession
            next()
          else
            console.log("! Error: Session ID #{request.sessionId} not found. Use Redis to persist sessions between server restarts. Terminating incoming request".red)
      else
        throw new Error('Cannot load session. Request does not contain a sessionId')