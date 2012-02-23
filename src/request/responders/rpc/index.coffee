# RPC Responder
# -------------
# Preloads all functions in /server/rpc recursively and executes them when 'rpc' messages come in

fs = require('fs')
coffee = require('coffee-script') if process.env['SS_DEV']

messagePrefix = 'rpc'

exports.init = (root, ss, config) ->

  messagePrefix: messagePrefix
  
  load: (middleware) ->

    # Get request handler
    request = require('./handler').init(root, messagePrefix, middleware, ss)

    # Return server interfaces
    server: require('./interfaces').init(request, messagePrefix)

    # Return code/HTML to be sent to browser
    client:
      code: ->
        extension = coffee? && 'coffee' || 'js'
        input = fs.readFileSync(__dirname + '/client.' + extension, 'utf8')
        coffee? && coffee.compile(input) || input
