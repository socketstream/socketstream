# RPC Responder
# -------------
# Preloads all functoins in /server/rpc/actions recursively and executes them when events come in

fs = require('fs')
coffee = require('coffee-script') if process.env['SS_DEV']

messagePrefix = 'rpc'

exports.init = (root, ss, config) ->

  messagePrefix: messagePrefix
  
  load: (middleware) ->

    server: require('./server').init(root, messagePrefix, middleware, ss)
    client:

      code: ->
        extension = coffee? && 'coffee' || 'js'
        input = fs.readFileSync(__dirname + '/client.' + extension, 'utf8')
        coffee? && coffee.compile(input) || input
