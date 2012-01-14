# Telemetry Responder
# -------------------
# Totally unfinished and undocumented yet. Do not use yet

fs = require('fs')
coffee = require('coffee-script') if process.env['SS_DEV']

messagePrefix = 'tel'

exports.init = (root, session, extensions, config) ->

  messagePrefix: messagePrefix

  load: ->
 
    server: require('./server').init(root, messagePrefix, extensions)
    client:

      code: ->
        cs = fs.readFileSync(__dirname + '/client.coffee', 'utf8')
        coffee.compile(cs)