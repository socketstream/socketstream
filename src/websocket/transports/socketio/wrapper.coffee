# Client-side Wrapper

window.SocketStream.transport =

  connect: (cb) ->
    conn = io.connect()

    conn.on 'message', (msg, meta) ->
      if (i = msg.indexOf('§')) > 0
        type = msg.substr(0, i)
        content = msg.substr(i+1)

        SocketStream.message.emit(type, content, meta)
      else
        console.error 'Invalid websocket message received:', msg

    conn.on 'getSessionId', (cb) ->
      # 'connect.sid' is the default cookie name used by Connect
      cb SocketStream.cookie.read('connect.sid')

    conn.on 'setSessionId', (sessionId, cb) ->
      SocketStream.cookie.write('session', sessionId)
      cb()

    conn.on 'ready', (cb) ->
      SocketStream.event.emit 'ready'

    conn.on 'disconnect', ->
      SocketStream.event.emit 'disconnect'

    conn.on 'reconnect', ->
      SocketStream.event.emit 'reconnect'

    conn.on 'connect', ->
      SocketStream.event.emit 'connect'

    SocketStream.transport.send = (msg) ->
      conn.send(msg)