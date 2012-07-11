# Client-side Wrapper

module.exports = (serverStatus, message, config = {}) ->

  connect: ->
    # If no config.url supplied Socket.IO will use default settings
    conn = io.connect(config.url, config)

    conn.on 'message', (msg, meta) ->
      if (i = msg.indexOf('|')) > 0
        responderId = msg.substr(0, i)
        content = msg.substr(i+1)

        message.emit(responderId, content, meta)
      else
        console.error('Invalid websocket message received:', msg)

    conn.on 'ready', (cb) ->
      serverStatus.emit('ready')

    conn.on 'disconnect', ->
      serverStatus.emit('disconnect')

    conn.on 'reconnect', ->
      serverStatus.emit('reconnect')

    conn.on 'connect', ->
      serverStatus.emit('connect')

    # Return send function
    (msg) -> conn.send(msg)