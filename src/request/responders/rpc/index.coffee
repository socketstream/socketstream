# RPC Responder
# -------------
# Preloads all functions in /server/rpc recursively and executes them when 'rpc' messages come in

fs = require('fs')

messagePrefix = 'rpc'

exports.init = (ss, config) ->

  messagePrefix: messagePrefix
  
  load: (middleware) ->

    # Get request handler
    request = require('./handler').init(ss, messagePrefix, middleware)

    # Serve client code
    code = fs.readFileSync(__dirname + '/client.' + (process.env['SS_DEV'] && 'coffee' || 'js'), 'utf8')
    ss.client.send('mod', 'socketstream-rpc', code, {coffee: process.env['SS_DEV']})
    ss.client.send('code', 'init', "require('socketstream-rpc');")

    # Return server interfaces
    require('./interfaces').init(request, messagePrefix)
