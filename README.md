## SocketStream

SocketStream makes it a breeze to build phenomenally fast, highly-scalable real-time apps on Node.js.

More coming soon at [www.socketstream.org](http://www.socketstream.org).


#### Features

* No-latency bi-directional communication between client and server using websockets (or flash sockets)
* Write client and server code in Coffeescript or Javascript - your choice
* Effortless scalable pub/sub baked right in. Not just for chat apps and stock tickers anymore! See examples below.
* In-built User model via @session.user with modular authentication
* Uses Redis for fast session retrieval, pub/sub, list of users online, and any other data your app needs instantly
* Works on all major browsers thanks to the excellent Socket.IO
* Automatically packages and minifies your client CSS and JS files (e.g. jQuery, Underscore.js, reset.css)
* Makes it easy to debug client code in development while automatically packing and minifying client code in staging/production
* Nested namespaces allow building of large 'enterprise' apps (only without the slowness!)
* Did we mention fast? SocketStream starts up instantly, ready to accept thousands of incoming connections
* Uses Jade (like HAML) for HTML
* Uses Ruby SASS for CSS (other options coming soon)


#### Philosophy

SocketStream is a radically different type of web framework. Instead of having multiple 'pages', each rendered by separate HTTP calls, SocketStream only has one 'page' of static HTML which is compressed and then sent the first time the client visits the site. At the same time all the CSS and client-side code your application will ever need is packaged, minified and sent to the client in the most optimal (CDN-friendly) way.

The magic happens courtesy of a websocket or 'flash socket' tunnel which is instantly created between the client and the Node.js server. This connection will be automatically restored should the connection fail.
From this point onwards all the data your application needs is sent over the tunnel asynchronously as serialized JSON objects. This means no HTTP connection latency and true bi-directional 'streaming' communication between client and server.


#### Installing

For now clone this project to a directory and link it as a local npm package with:

`npm link`

There is no rails-like project generator yet, so you'll need to checkout the example_site project too (available shortly!).


#### Quick Example

The key to using socket stream is the `remote` method which is available anywhere within the client app.

For example, let's square a number on the server:

On the client side, add this to the /app/client/app.coffee file:

    class window.App

      init: (number) ->
        remote 'app.square', number, (response) ->
          console.log "#{number} squared is #{response}"


And on the server, add this to /app/server/app.coffee

    class exports.App

      square: (number, cb) ->
        cb(number * number)


That's it! Want to see something a bit more advanced? How about reverse geocoding using HTML5 geolocation?


#### Reverse Geocoding Example

For the server code, create the file /app/server/geocode.coffee and paste in the following code:

    class exports.Geocode

      lookup: (coords_from_browser, cb) ->
        host = 'maps.googleapis.com'
        r = coords_from_browser.coords
        http = require('http')
        google = http.createClient(80, host)
        google.on 'error', (e) -> console.error "Unable to connect to #{host}"
        request = google.request 'GET', "/maps/api/geocode/json?sensor=true&latlng=#{r.latitude},#{r.longitude}"
        request.end()
        request.on 'error', (e) -> console.error "Unable to parse response from #{host}"
        request.on 'response', (response) => @_parseResponse(response, cb)

      _parseResponse: (response, cb) -> # note: private methods beginning with an underscore cannot be called remotely
        output = ''
        response.setEncoding('utf8')
        response.on 'data', (chunk) -> output += chunk
        response.on 'end', ->
          j = JSON.parse(output)
          result = j.results[0]
          cb(result)


To capture your location and output your address, lets's add this code into  /app/client/app.coffee

    class window.App
    
      constructor: ->
        @geocode = new App.geocode

      init: ->
        # Note: this app.init method will get automatically called once the socket is established and the session is ready
        @geocode.determineLocation()


Then, purely to demonstrate a nice way to do client-side namespacing, let's create a new file called /app/client/geocode.coffee and paste this in:

    class App.geocode

      determineLocation: ->
        if navigator.geolocation
          navigator.geolocation.getCurrentPosition(@_success, @_error)
        else
          alert 'Oh dear. Geolocation is not supported by your browser. Time for an upgrade.'

      _success: (coords_from_browser) ->
        remote 'geocode.lookup', coords_from_browser, (response) ->
          console.log response
          alert 'You are currently at: ' + response.formatted_address

      _error: (err) ->
        console.error err
        alert 'Oops. The browser cannot determine your location. Are you online?'
        
Run this code and you should see your current location pop up (pretty accurate if you're on WiFi).
Of course, you'll need to handle the many and various errors that could go wrong during this process with a callback to the client.

Bonus tip: Want to show your location again? Just type 'app.geocode.determineLocation()' from the browser console. All client-side functions can be called this way.


#### Pub/Sub Example

Want to build a chat app or push an notification to a particular user?
    
First let's listen out for an event called 'newMessage' on the client:

    class window.App

      init: ->
        $SS.events.newMessage = (message) -> alert(message)
          
Then, assuming we know the person's user_id, we can publish the event directly to them. On the server side you'd write:

    class exports.App

      testMessage: (user_id) ->
        $SS.publish.user(user_id, 'newMessage', 'Wow this is cool!')

Pretty cool eh? But it gets better. We don't have to worry which server the user is connected to. The message will always be routed to the correct server as each SocketStream server subscribes to the same instance of Redis.

What happens if we want to notify every user when data has changed, or let everyone know the system is going down for maintenance? Simple, just use the broadcast method:

    $SS.publish.broadcast('flash', {type: 'notification', message: 'Notice: This service will be temporarily unavailable in 10 minutes'})
    
Ah, but you have thousands of users across hundreds of servers you say? No problem. The workload is distributed to every connected Node.js instance by design. I'm sure you can see where this is going... ;-)


#### Coming Soon

So so much... including:

* Build rate-limiting into SocketStream to block clients attempting to DDOS the connection
* Horizontal scaling by downloading a list of active servers and automatically trying new servers should one fail over, no load balancers required!
* Beautiful super-fast browser-based testing
