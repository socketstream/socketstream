# RPC Responder
# -------------
# Preloads all functions in /server/rpc recursively and executes them when 'rpc' messages come in

fs = require('fs')

messagePrefix = 'rpc'

exports.init = (root, ss, client, config) ->

  messagePrefix: messagePrefix
  
  load: (middleware) ->

    # Get request handler
    request = require('./handler').init(root, messagePrefix, middleware, ss)

    # Serve client code
    code = fs.readFileSync(__dirname + '/client.' + (process.env['SS_DEV'] && 'coffee' || 'js'), 'utf8')
    client.assets.add('mod', 'socketstream-rpc', code, {coffee: process.env['SS_DEV']})
    client.assets.add('code', 'init', "require('socketstream-rpc');")

    ### RETURN API ###

    # Return server interfaces
    server: require('./interfaces').init(request, messagePrefix)


        
