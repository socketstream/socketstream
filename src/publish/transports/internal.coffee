# Publish Event - Internal EventEmitter Transport

EventEmitter2 = require('eventemitter2').EventEmitter2
emitter = new EventEmitter2()

module.exports = ->

  listen: (cb) ->
    emitter.on 'event', cb

  send: (obj) ->
    emitter.emit 'event', obj