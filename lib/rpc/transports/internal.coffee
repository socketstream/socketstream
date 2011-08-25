# Internal RPC Transport
# ----------------------
# Used when running in single-process mode

EventEmitter = require('events').EventEmitter

# Setup internal EventEmitters
SS.internal.rpc.server = new EventEmitter
SS.internal.rpc.event_proxy = new EventEmitter

class exports.Client

  connect: (@name) ->

  send: (obj) ->
    socket = SS.internal.rpc.server
    socket.emit 'server', obj

  listen: (cb) ->
    socket = SS.internal.rpc.clients[@name] = new EventEmitter
    socket.on 'client', cb


class exports.Server

  connect: ->

  listen: (cb) ->
    SS.internal.rpc.server.on 'server', (obj) ->
      cb obj, (result) ->
        SS.internal.rpc.clients[obj.origin].emit 'client', result


class exports.Publisher

  connect: ->

  send: (msg_type, message) ->
    SS.internal.rpc.event_proxy.emit 'event', msg_type, message


class exports.Subscriber

  connect: ->

  listen: (cb) ->
    SS.internal.rpc.event_proxy.on 'event', cb 

