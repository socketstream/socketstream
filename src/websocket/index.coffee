# Websocket Module
# ----------------
# Handles everything to do with the websocket transport and message responders

EventEmitter2 = require('eventemitter2').EventEmitter2
emitter = new EventEmitter2({wildcard: true})

exports.init = (root, extensions) ->
  transport:   require('./transport').init(emitter)
  responders:  require('./responders').init(root, emitter, extensions)
  message:     emitter
