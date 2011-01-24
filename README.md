## SocketStream

SocketStream makes it a breeze to build phenomenally fast, highly-scalable real-time apps on Node.js. 

More coming soon at [www.socketstream.org](http://www.socketstream.org).


#### Features

* No-latency bi-directional communication between client and server using websockets (or flash sockets)
* Let's you write in Coffeescript or Javascript interchangeably
* Uses Redis for session storage and forthcoming pub/sub
* Works on all major browsers thanks to the excellent Socket.IO
* Automatically packages and minifies your client CSS and JS files (e.g. jQuery, Underscore.js, reset.css)
* Makes it easy to debug client code in development while automatically packing and minifying client code in staging/production
* Designed to scale to large apps over thousands of servers
* Uses Jade (like HAML) for HTML
* Uses Ruby SASS for CSS (other options coming soon)


#### Philosophy

SocketStream is a radically different type of web framework. Instead of having multiple 'pages', each rendered by separate HTTP calls, SocketStream only has one 'page' of static HTML which is compressed and then sent the first time the client visits the site. At the same time all the CSS and client-side code your application will ever need is packaged, minified and sent to the client in the most optimal (CDN-friendly) way.

The magic happens curtousy of a websocket or 'flash socket' tunnel which is instantly created between the client and the Node.js server.
From this point onwards all the data your application needs is sent over the tunnel asynchronously as serialized JSON objects. This means no HTTP connection latency and true bi-directional 'streaming' communication between client and server.


#### Installing

For now clone this project to a directory and link it as a local npm package with:

`npm link`

There is no rails-like project generator yet, so you'll need to checkout the example_site project too (available shortly!).


#### Example

The key to using socket stream is the `remote` method which is available anywhere within the client app.

For example, let's square a number on the server:

In the client folder add this function to app.coffee

    class App

      square: (number) ->
        remote 'app.square', number, (response) ->
          console.log "#{number} squared is #{response}"


In the server folder add this function to app.coffee

    class exports.App

      square: (number, cb) ->
        cb(number * number)


That's it! More examples to come.


#### Coming Soon

So so much... including:

* Integrated super-fast modular User Authentication (the best bits of Authlogic for rails)
* Build rate-limiting into SocketStream to block clients attempting to DDOS the connection
* Horizontal scaling by downloading a list of active servers and automatically trying new servers should one fail over, no load balancers required!
* Beautiful super-fast browser-based testing
