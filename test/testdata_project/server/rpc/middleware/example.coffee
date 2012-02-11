# Example middleware

# Only let a request through if the session has been authenticated
exports.authenticated = ->
  (req, res, next) ->
    if req.session && req.session.userId?
      next()
    else
      res(false)
