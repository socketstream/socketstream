# Realtime Models
# ---------------
# NOTE: All highly experimental and certain to change!

fs = require('fs')

exports.rest = require('./rest.coffee')

exports.broadcast = (msg) ->
  $SS.publish.broadcast('rtm', msg)

