exports.doNothing = ->
  return (req, res, next) ->
    return next()

