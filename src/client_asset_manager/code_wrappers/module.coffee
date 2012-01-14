# Adds a Module wrapper around code files to be sent ot the client. Highly experimental!

exports.process = (code, path) ->
  "SocketStream.modules['#{modPath(path)}'] = {mod: function(exports, require){#{code}}, path: '#{path}'};"

# Private
modPath = (path) ->
  out = path.split('.'); out.pop(); out = out.join()
  out.split('/').splice(1).join('/')