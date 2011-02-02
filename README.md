## SocketStream

SocketStream makes it a breeze to build phenomenally fast, highly-scalable real-time apps on Node.js.

More coming soon at [www.socketstream.org](http://www.socketstream.org).


### Features

* No-latency bi-directional communication between client and server using websockets (or flash sockets)
* Write client AND server code in [Coffeescript](http://jashkenas.github.com/coffee-script/) or Javascript - your choice
* Effortless scalable pub/sub baked right in. Not just for chat apps and stock tickers anymore! See examples below.
* In-built User model via @session.user with modular authentication
* Uses Redis for fast session retrieval, pub/sub, list of users online, and any other data your app needs instantly
* Works on all major browsers thanks to the excellent Socket.IO
* Automatically packages and minifies your client CSS and JS files (e.g. jQuery, Underscore.js, reset.css)
* Makes it easy to debug client code in development while automatically packing and minifying client code in staging/production
* Nested namespaces allow building of large 'enterprise' apps (only without the slowness!)
* Did we mention fast? SocketStream starts up instantly, ready to accept thousands of incoming connections
* Bundled with, but not dependent on, jQuery 1.5
* Uses [Jade](http://jade-lang.com/) to render static HTML
* Uses [Stylus](http://learnboost.github.com/stylus/) for CSS


### Philosophy

SocketStream is a new web framework built around the [Single-page Application](http://en.wikipedia.org/wiki/Single-page_application) paradigm. It embraces websockets, in-memory datastores (Redis), and client-side rendering to provide an ultra-responsive experience that will amaze your users.


### How does it work?

SocketStream automatically compresses and minifies all the static HTML, CSS and client-side code your app will ever need and sends this through the first time a user visits your site.

From then on all application data is sent and received as serialized JSON objects over a websocket (or 'flash socket') tunnel, instantly established when the client connects and automatically re-established if broken.

All this means no more connection latency, HTTP header overhead, or slow AJAX calls. Just true bi-directional, asynchronous, 'streaming' communication between client and server.

Note: While SocketStream is a perfect fit for all manner of modern applications which require real-time data (chat, stock trading, location monitoring, analytics, etc), it would make a poor choice for a blog or other content-rich site which requires unique URLs for search engine optimization.


### Quick Example

The key to using socket stream is the `remote` method which is available anywhere within the client app.

For example, let's square a number on the server:

On the client side, add this to the /app/client/app.coffee file:

    class window.App

      square: (number) ->
        remote 'app.square', number, (response) ->
          console.log "#{number} squared is #{response}"


And on the server, add this to /app/server/app.coffee

    class exports.App

      square: (number, cb) ->
        cb(number * number)

Refresh your page then type this into the browser console:

    app.square(25)

And you will see the following output:

    25 squared is 625


Ready for something a bit more advanced? Let's take a look at reverse geocoding using HTML5 geolocation...


### Reverse Geocoding Example

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

**Bonus tip:** Want to run this again? Just type 'app.geocode.determineLocation()' from the browser console. All client-side functions can be called this way.


### Pub/Sub Example

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

    $SS.publish.broadcast('flash', {type: 'notification', message: 'Notice: This service is going down in 10 minutes'})
    
Ah, but you have thousands of users across hundreds of servers you say? No problem. The workload is distributed across every connected Node.js instance by design. I'm sure you can see where this is going... ;-)


### Requirements

[Node 0.3.5](http://nodejs.org/#download) or above

[NPM](http://npmjs.org/) (Node Package Manager)

[Redis 2.2](http://redis.io/) or above


### Getting Started

Ready to give it a whirl? SocketStream is highly experimental at the moment, but we're using it in new projects and improving it every day.

For now clone this project to a directory and link it as a local npm package with:

    npm link

To generate a new empty SocketStream project, simply type:

    socketstream <name of your project>

The directories generated will be very familiar to Rails users. Here's a brief overview:

#### /app/client
* All files within /app/client will be converted to Javascript and sent to the client
* The app.init() function will be automatically called once the websocket connection is established
* Changing any client will not require a restart in development mode (NODE_ENV=development), just hit refresh on the browser
* Client code is automatically concatenated and minified in staging and production (NODE_ENV=staging)
* Nesting client files within folders is not supported yet
* If you have a Javascript library you wish to use (e.g. jQuery UI), put this in /lib/client instead
* All client code can be called from the console using the 'app' variable (app is an instance of window.App)
* The /app/client/app.coffee file must always be present

#### /app/server
* All files in this directory behave similar to Controllers in traditional MVC frameworks
* For example, to call app.init from the client and pass 25 as params, type remote('app.init',25,function(){ alert(this); })
* The last argument must always be the callback (cb). If app.init were to call cb('hello it works') we would see this message popup
* All methods are automatically accessible via the client unless they begin with an underscore - so be careful!
* If the method takes incoming params, these will be pushed into the first argument. The second must always be the callback.
* Each file must begin 'class exports.' followed by the capitalized name of the file (e.g. 'class exports.User')
* Server files can be nested. E.g. remote('users.online.yesterday') would reference the 'yesterday' method in /app/server/users/online.coffee
* @session gives you direct access to the User's session
* @user gives you direct access to your custom User code. More on this coming soon
* The /app/server/app.coffee file must always be present

#### /app/css
* /app/css/app.stly must exist. This should contain your stylesheet code in [Stylus](http://learnboost.github.com/stylus/) format (similar to SASS)
* Additional Stylus files can be imported into app.stly using @import 'name_of_file'
* Changing any file within /app/css will automatically trigger Stylus re-compilation
* CSS files will be compressed in staging or production mode
* If you wish to use CSS libraries within your project (e.g. reset.css or jQuery UI) put these in /lib/css instead

#### /app/views
* /app/views/app.jade must exist. This should contain all the static HTML your app needs in [Jade](http://jade-lang.com/) format (similar to HAML)
* The HTML HEAD tag must contain '!= SocketStream'. This helper ensures all the correct libraries are loaded depending upon the environment (declared by NODE_ENV)
* Only one view file is supported at the moment. We may implement 'partials' in the future.
* Changing the /app/views/app.jade file, or any other client asset file, will automatically trigger Jade re-compilation when in development mode

#### /lib
* Changes to files within /lib/client or /lib/css automatically triggers re-compilation of client assets in development mode
* Easily control the order your client libraries are loaded by prefixing them with a number (e.g. 1.jquery.js, 2.jquery-ui.js)
* Client JS files are automatically minified unless the filename contains '.min'
* Any files within /lib/server can be required automatically by Node. Ideal for custom authentication modules

#### /public
* Store your static files here (e.g. /public/images, robots.txt, etc)
* The /public/assets folder is managed by SocketStream and should not be touched

#### /vendor
* Put any vendored libraries in here using the format /vendor/mycode/lib/mycode.js


Before starting up your new app, make sure you have Redis 2.2+ running on your localhost, then type:

    node app.coffee
    
If all goes well you'll see the SocketStream banner coming up, then you're ready to start coding!


### Coming Soon

So so much... including:

* Lots more documentation, a tutorial and many more examples
* Build rate-limiting into SocketStream to block clients attempting to DDOS the connection
* Horizontal scaling by downloading a list of active servers and automatically trying new servers should one fail over, no load balancers required!
* Beautiful super-fast browser-based testing
