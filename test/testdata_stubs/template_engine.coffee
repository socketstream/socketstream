
exports.init = (name) ->
  name: name
  prefix: -> "<#{@name}::prefix>"
  suffix: -> "<#{@name}::suffix>"

  process: (template, path, id) -> "[#{id}::#{template}]"
