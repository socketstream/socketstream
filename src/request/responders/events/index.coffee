# Browser Events Responder
# ------------------------
# Takes incoming event message types and converts them into a format suitable for sending over the websocket

fs = require('fs')
coffee = require('coffee-script') if process.env['SS_DEV']

messagePrefix = 'event'

exports.init = (root, ss, config) ->

  messagePrefix: messagePrefix

  load: ->

    server:

      websocket: (obj, send, meta) ->
        msg = JSON.stringify(obj)
        send(messagePrefix + '|'+ msg)

    client:

      code: ->
        extension = coffee? && 'coffee' || 'js'
        input = fs.readFileSync(__dirname + '/client.' + extension, 'utf8')
        coffee? && coffee.compile(input) || input