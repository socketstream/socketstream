# Publish Event API
# -----------------
# Allows you to publish events to browser clients. All this code is closely related to the 'event' websocket responder

module.exports = ->
  
  transport: require('./transport')()

  api: (transport) ->

    methods =

      all: (event, params...) ->
        obj = {t: 'all', e: event, p: params}
        transport.send(obj)
        console.log('➙'.cyan, 'event:all'.grey, event) unless isInternal(event)

      socketId: (socketId, event, params...) ->
        obj = {t: 'socketId', socketId: socketId, e: event, p: params}
        transport.send(obj)
        console.log('➙'.cyan, "event:socketId:#{socketId}".grey, event)
      
      users: (users, event, params...) ->
        users = users instanceof Array && users || [users]
        obj = {t: 'user', users: users, e: event, p: params}
        transport.send(obj)
        console.log('➙'.cyan, "event:users:[#{users.join(',')}]".grey, event)

      channels: (channels, event, params...) ->
        channels = channels instanceof Array && channels || [channels]
        obj = {t: 'channel', channels: channels, e: event, p: params}
        transport.send(obj)
        console.log('➙'.cyan, "event:channels:[#{channels.join(',')}]".grey, event)

    # Alias 0.2 command
    methods.broadcast = methods.all

    # Alias singles to plurals
    methods.channel = methods.channels
    methods.user = methods.users

    # Return all methods
    methods


# Private

isInternal = (event) ->
  event.substr(0,5) == '__ss:'

