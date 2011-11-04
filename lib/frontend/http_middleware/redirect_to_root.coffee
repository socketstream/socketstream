# Middleware: Redirect all requests to root
# -----------------------------------------
# Enables mock HTTP routing (pushstate) to function in production mode

module.exports = ->

  (request, response, next) ->
    ext = request.url.split('.')[1]
    request.url = '/' unless ext
    next()
