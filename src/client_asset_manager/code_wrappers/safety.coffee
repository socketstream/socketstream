# Adds a Safety function wrapper around the code (as CoffeeScript does by default)

exports.process = (code, path) ->
  "(function(require){#{code}}).call(this, SocketStream.require);"