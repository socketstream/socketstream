# Browser Events Responder
# ------------------------
# Takes incoming event message types and converts them into a format suitable for sending over the websocket

fs = require('fs')

module.exports = (responderId, config, ss) ->

  name = config && config.name || 'events'

  # Serve client code
  code = fs.readFileSync(__dirname + '/client.' + (process.env['SS_DEV'] && 'coffee' || 'js'), 'utf8')
  ss.client.send('mod', 'events-responder', code, {coffee: process.env['SS_DEV']})
  ss.client.send('code', 'init', "require('events-responder')(#{responderId}, {}, require('socketstream').send(#{responderId}));")

  # Return API
  name: name

  interfaces: (middleware) ->

    websocket: (msg, meta, send) ->
      send(JSON.stringify(msg))
