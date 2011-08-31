### Handling Disconnects

Both websocket and 'flashsocket' tunnels are surprisingly resilient to failure; however, as developers we must always assume the connection will fail from time to time, especially as the client may be on an unstable mobile connection.

#### Client Side

We recommend binding a function to the 'disconnect' and 'connect' events provided by the SocketStream client (courtesy of Socket.IO). For example:

``` coffee-script
SS.socket.on('disconnect', -> alert('Connection Down'))

SS.socket.on('connect', -> alert('Connection Up'))
```

These events can be used client side to toggle an online/offline icon within the app, or better still, to dim the screen and show a 'Attempting to reconnect...' message to users.

You may also want to run custom code on the server when a client connects or disconnects. If so, check out Server-side Events in /doc/guide/en/developing/server-side_events.md