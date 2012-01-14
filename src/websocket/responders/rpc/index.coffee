# RPC Responder
# -------------
# Preloads all functoins in /server/rpc recursively and executes them when events come in

fs = require('fs')
coffee = require('coffee-script') if process.env['SS_DEV']

messagePrefix = 'rpc'

exports.init = (root, session, extensions, config) ->

  messagePrefix: messagePrefix
  
  load: ->

    server: require('./server').init(root, messagePrefix, session, extensions)
    client:

      code: ->
        extension = coffee? && 'coffee' || 'js'
        input = fs.readFileSync(__dirname + '/client.' + extension, 'utf8')
        coffee? && coffee.compile(input) || input
