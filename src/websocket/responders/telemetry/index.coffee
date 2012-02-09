# Telemetry Responder
# -------------------
# Totally unfinished and undocumented yet. Do not use

fs = require('fs')
coffee = require('coffee-script') if process.env['SS_DEV']

messagePrefix = 'tel'

exports.init = (root, ss, config) ->

  messagePrefix: messagePrefix

  load: ->
 
    server: require('./server').init(root, messagePrefix, ss)
    client:

      code: ->
        extension = coffee? && 'coffee' || 'js'
        input = fs.readFileSync(__dirname + '/client.' + extension, 'utf8')
        coffee? && coffee.compile(input) || input