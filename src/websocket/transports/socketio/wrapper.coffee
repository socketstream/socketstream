# Client-side Wrapper

conn = null

module.exports = (emitter, message) ->

  connect: (fn) ->
    conn = io.connect()

    conn.on 'message', (msg, meta) ->
      if (i = msg.indexOf('|')) > 0
        type = msg.substr(0, i)
        content = msg.substr(i+1)

        message.emit(type, content, meta)
      else
        console.error 'Invalid websocket message received:', msg

    conn.on 'ready', (cb) ->
      emitter.emit 'ready'

    conn.on 'disconnect', ->
      emitter.emit 'disconnect'

    conn.on 'reconnect', ->
      emitter.emit 'reconnect'

    conn.on 'connect', ->
      emitter.emit 'connect'

    # Return send function
    (msg) -> conn.send(msg)