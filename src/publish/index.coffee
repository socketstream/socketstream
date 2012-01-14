# Publish Event API
# -----------------
# Allows you to publish events to browser clients. All this code is closely related to the 'event' websocket responder

exports.init = ->
  
  transport:  require('./transport').init()

  api:        (transport) ->

    methods =

      all: (event, params...) ->
        obj = {t: 'all', e: event, p: params}
        transport.send(obj)
        console.log '➙'.cyan, 'all'.grey, event

      socketId: (socketId, event, params...) ->
        obj = {t: 'socketId', socketId: socketId, e: event, p: params}
        transport.send(obj)
        console.log '➙'.cyan, "socketId:#{socketId}".grey, event
      
      users: (users, event, params...) ->
        users = users instanceof Array && users || [users]
        obj = {t: 'user', users: users, e: event, p: params}
        transport.send(obj)
        console.log '➙'.cyan, "users:[#{users.join(',')}]".grey, event

      channels: (channels, event, params...) ->
        channels = channels instanceof Array && channels || [channels]
        obj = {t: 'channel', channels: channels, e: event, p: params}
        transport.send(obj)
        console.log '➙'.cyan, "channels:[#{channels.join(',')}]".grey, event

    # Alias singles to plurals
    methods.broadcast = methods.all
    methods.channel = methods.channels
    methods.user = methods.users

    # Return all methods
    methods

  


