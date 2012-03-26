# Browser Events Responder
# ------------------------
# Takes incoming event message types and converts them into a format suitable for sending over the websocket

fs = require('fs')

messagePrefix = 'event'

exports.init = (root, ss, client, config) ->

  messagePrefix: messagePrefix

  load: ->

    # Serve Client Code
    code = fs.readFileSync(__dirname + '/client.' + (process.env['SS_DEV'] && 'coffee' || 'js'), 'utf8')
    client.assets.add('mod', 'socketstream-events', code, {coffee: process.env['SS_DEV']})
    client.assets.add('code', 'init', "require('socketstream-events');")

    ### RETURN API ###

    server:

      websocket: (obj, send, meta) ->
        msg = JSON.stringify(obj)
        send(messagePrefix + '|'+ msg)
