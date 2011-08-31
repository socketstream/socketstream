### Plug Sockets

_Module status: Disabled by default. Enable with `SS.config.plug_sockets.enabled = true`_

Plug Sockets allow your SocketStream app to easily connect to external servers using [ZeroMQ](http://www.zeromq.org/).

As ZeroMQ bindings are available in over 20 languages (including C, C++, Java, Ruby, PHP, .net, Erlang, and of course Node.js), there's a good chance you'll be able to get SocketStream talking to any game server, message server, or anything else you may want to chat to - all at speeds far faster than any HTTP-based webservice can offer.

Plug Sockets are deliberately implemented at a very low level to allow you to decide upon the best message format for your use case. Hence you may send and receive using Msgpack, BSON, Netstrings, or just raw binary buffers.

To help make dealing with typical JSON RPC asynchronous requests easy, the optional 'callbacks = true' option wraps the raw ZeroMQ socket with an asynchronous request handler.

Let's look at some examples. First, using raw ZeroMQ sockets to talk to a server we'll call 'velocity':

In your app.coffee config file add:

``` coffee-script

  exports.config =

    plug_sockets:
      enabled: true
      plugs:
        velocity:
          connect_to: 'tcp://10.0.0.1:5000'
```

You are now able to access the raw ZeroMQ socket commands from your server-side code:

``` coffee-script

  # From your /app/server code
  SS.plugs.velocity.send 'Hello from node'

  # Listen for responses in /config/events.coffee
  SS.plugs.velocity.on 'message', (msg) ->
    console.log 'Message received from Velocity server:', msg.toString()
```

Here you'll see we're passing a string, but this could be any Node.js buffer. Even large video files can efficiently be sent via ZeroMQ.

While raw sockets may well be all you need, the chances are good you'll want to make a RPC call and execute a callback in response typical Node.js style.

Let's setup another Plug Socket, this time one designed to use JSON RPC calls. We'll call it 'boomerang':

``` coffee-script

  exports.config =

    plug_sockets:
      enabled: true
      plugs:
        velocity:
          connect_to: 'tcp://10.0.0.1:5000'
        boomerang:
          connect_to: 'tcp://rpc.mysite.com:9000'
          callbacks: true
          debug: true
```

Notice the `callbacks: true` option.

Now we don't have to listen to incoming replies in /config/events.coffee - we just send requests with callbacks the same way as you'd call an `SS.server` method from the browser. Now we can write code in /app/server which looks like this:

``` coffee-script

  exports.actions =

    # Move your car and send the new position directly back via the websocket
    moveCar: (position, cb) ->
      SS.plugs.boomerang.send {method: 'moveCar', user_id: @session.user_id, position: position}, cb

    # Get a list of all players from the game server, take the first 10 and make them uppercase
    getPlayers: (cb) ->
      SS.plugs.boomerang.request {method: 'getPlayers'}, (response) ->
        top_ten = response.result.slice(0,10).map (player) -> player.toUpperCase()
        cb {top_ten: top_ten, num_all_players: response.result.length}
```

#### How to setup External Servers

We'll document more here in the future and include some examples of external services written in other languages. But for now there are two key things to remember when creating an external service:

  1. Listen out for incoming requests by creating and binding a ZeroMQ XREP (or DEALER) socket
  2. If you've enabled callbacks use JSON to unpack/pack messages and always pass the incoming 'id' field back through the response


#### Legacy Apps

In the future we'd like to come up with a standard way to connect to existing legacy apps so you can create a new real time interface whilst keeping your existing models, business logic and tests.

For example, it would be great to have a socketstream ruby gem which loads a light-weight ZeroMQ driver when your Rails application starts up. This would allow you to write something like:

``` coffee-script
exports.actions = 

  getCustomers: (limit, cb) ->
    SS.plugs.rails.send "Customer.active(:limit => #{parseInt(limit)})", cb
```

If anyone fancies taking up this challenge please do! We'll help in anyway we can.
