## SocketStream

SocketStream makes it a breeze to build phenomenally fast, highly-scalable real-time web applications on Node.js.

Latest release: 0.0.7


### Features

* True bi-directional communication using websockets (or flash sockets)
* Crazy fast! Starts up instantly. No HTTP handshaking/headers/routing to slow you down
* Works on all major browsers thanks to the excellent [Socket.IO](http://socket.io/)
* Write client and server code in [Coffeescript](http://jashkenas.github.com/coffee-script/) or Javascript - your choice
* Easily share code between the client and server. Ideal for business logic and model validation
* Free HTTP API! All server-side code is also accessible over a high-speed request-based API
* Effortless, scalable, pub/sub baked right in. See examples below
* Awesome asset packer! Automatically packages and [minifies](https://github.com/mishoo/UglifyJS) your client-side code
* In-built User model with modular authentication
* Uses [Redis](http://www.redis.io/) for fast session retrieval, pub/sub, list of users online, and any other data your app needs instantly
* Nested namespaces allow building of large 'enterprise' apps (only without the slowness!)
* Interactive console - just type 'socketstream console'
* Bundled with jQuery 1.5. Easily add additional client libraries such as [Underscore.js](http://documentcloud.github.com/underscore/)
* Easily create jQuery templates using the [official plugin](http://api.jquery.com/category/plugins/templates/). Works like partials in Rails.
* Uses [Jade](http://jade-lang.com/) to render static HTML
* Uses [Stylus](http://learnboost.github.com/stylus/) for CSS
* MIT Licence


### Introduction

SocketStream is a new full stack web framework built around the [Single-page Application](http://en.wikipedia.org/wiki/Single-page_application) paradigm. It embraces websockets, in-memory datastores (Redis), and client-side rendering to provide an ultra-responsive experience that will amaze your users.


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

You can also call this method over HTTP with the following URL:

    /api/app/square.json?5           (Hint: use .html to output on screen)

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

[Node 0.4](http://nodejs.org/#download) or above

[NPM](http://npmjs.org/) (Node Package Manager)

[Redis 2.2](http://redis.io/) or above


### Getting Started

Ready to give it a whirl? SocketStream is highly experimental at the moment, but we're using it in new projects and improving it every day.

For now clone this project to a directory and link it as a local npm package with:

    npm link

To generate a new empty SocketStream project, simply type:

    socketstream new <name of your project>

The directories generated will be very familiar to Rails users. Here's a brief overview:

#### /app/client
* All files within /app/client will be converted to Javascript and sent to the client
* The app.init() function will be automatically called once the websocket connection is established
* All client code can be called from the console using the 'app' variable (app is an instance of window.App)
* If you have a Javascript library you wish to use (e.g. jQuery UI), put this in /lib/client instead
* Nesting client files within folders is not supported yet. We will implement this once we settle on the best design
* The /app/client/app.coffee file must always be present
* View incoming/outgoing calls in the browser console in development (controlled with $SS.config.client.log.level)
* Coffeescript client files are automatically compiled and served on-the-fly in development mode and pre-compiled/minified/cached in staging and production

#### /app/server
* All files in this directory behave similar to Controllers in traditional MVC frameworks
* For example, to call app.init from the client and pass 25 as params, call remote('app.init',25,function(){ alert(this); }) in the client
* All methods can be automatically accessed via the in-built HTTP API (e.g. /api/app/square.json?5)
* The last argument must always be the callback (cb). If app.init were to call cb('hello it works') we would see this message popup
* If the method takes incoming params, these will be pushed into the first argument. The second must always be the callback.
* Each file must begin 'class exports.' followed by the capitalized name of the file (e.g. 'class exports.User')
* Server files can be nested. E.g. remote('users.online.yesterday') would reference the 'yesterday' method in /app/server/users/online.coffee
* All methods are publicly accessible unless they begin with an underscore - so be careful!
* @session gives you direct access to the User's session
* @user gives you direct access to your custom User instance. More on this coming soon
* The /app/server/app.coffee file must always be present

#### /app/shared
* All files within /app/shared will be converted to Javascript and sent to the client. In addition they can also be used server-side
* Ideal for business logic and models that need to validate on the client (for speed) yet ensure integrity before saving to the DB
* Start your file with the same header you would for a server file. E.g. class exports.Filter
* Use it client-side by instantiating the class: filter = new exports.Filter
* Use it server-side by first requiring the file, then instantiating the class: Filter = require('filter').Filter; filter = new Filter;
* WARNING: All code within this folder will be sent to the client. Do not include any proprietary secret sauce or use database/filesystem calls

#### /app/css
* /app/css/app.stly must exist. This should contain your stylesheet code in [Stylus](http://learnboost.github.com/stylus/) format (similar to SASS)
* Additional Stylus files can be imported into app.stly using @import 'name_of_file'. Feel free to nest files if you wish.
* If you wish to use CSS libraries within your project (e.g. reset.css or jQuery UI) put these in /lib/css instead
* Stylus files are automatically compiled and served on-the-fly in development mode and pre-compiled/compressed/cached in staging and production

#### /app/views
* /app/views/app.jade must exist. This should contain all the static HTML your app needs in [Jade](http://jade-lang.com/) format (similar to HAML)
* The HTML HEAD tag must contain '!= SocketStream'. This helper ensures all the correct libraries are loaded depending upon the environment (declared by NODE_ENV)
* Easily nest additional html as jQuery templates (similar to Rails partials). E.g /app/views/people/info.jade is accessible as $("#people-info").tmpl(myData)
* Jade views and templates are automatically compiled and served on-the-fly in development and pre-compiled/compressed/cached in staging and production

#### /lib
* Changes to files within /lib/client or /lib/css automatically triggers re-compilation/packing/minification of client assets
* Easily control the order your client libraries are loaded by prefixing them with a number (e.g. 1.jquery.js, 2.jquery-ui.js)
* Client JS files are automatically minified by [UglifyJS](https://github.com/mishoo/UglifyJS) unless the filename contains '.min'
* Any files within /lib/server can be required automatically by Node. Ideal for custom authentication modules

#### /public
* Store your static files here (e.g. /public/images, robots.txt, etc)
* The /index.html file and /public/assets folder are managed by SocketStream and should not be touched

#### /vendor
* Put any vendored libraries in here using the format /vendor/mycode/lib/mycode.js
* This directory is optional


Before starting up your new app, make sure you have Redis 2.2+ running on your localhost, then type:

    socketstream start
    
If all goes well you'll see the SocketStream banner coming up, then you're ready to start!


### Connecting to Redis

Redis is automatically accesssible anywhere within your server-side code using the R global variable. E.g.

    R.set("string key", "string val")

    R.get("string key", (err, data) -> console.log(data))    # prints 'string val'

All internal SocketStream keys and channels are prefixed with 'socketstream:', so feel free to use anything else.

[View full list of commands](http://redis.io/commands)


### Connecting to Databases

Building a great DB connection framework is very much a focus for a future releases, but this is how we're connecting to mongoDB today.

The /config/db.coffee (or .js) file is loaded automatically at startup, if present. So you can do something like this:

    mongodb = require('mongodb')   # installed by npm
    Db = mongodb.Db
    Connection = mongodb.Connection
    Server = mongodb.Server
    global.M = new Db('my_database_name', new Server('localhost', 27017))
    M.open (err, client) -> console.error(err) if err?

This would allow you to access mongoDB from the M global variable.

As this file is loaded after the environment config is processed, you can put your db connection params in /config/environments/development.json

    {
      "db": {
        "mongo": {"database": "my_database_name", "host": "localhost", "port": 27017},
      }
    }

Then access them inside /config/db.coffee as so:

    config = $SS.config.db.mongo
    global.M = new Db(config.database, new Server(config.host, config.port))

We've not tested SocketStream with CouchDB, MySQL, or any other DB, but the principals should be the same.


### Tests

There are a handful of tests at the moment, but there will be more once the internal API becomes stable.

If you wish to run the test suite, install jasbin:

    npm install jasbin

Then run jasbin in the SocketStream directory:
  
    cd socketstream/
    jasbin


### Contributors

* Owen Barnes (socketstream)
* Paul Jensen (paulbjensen)

We welcome contributions from forward-thinking hackers keen to redefine what's possible on the web. Big, bold ideas, unconstrained by frameworks and concepts from the past, will always be welcome.

The best developers take 10 lines of code and come up with a completely new design that needs 3. If you're one of these rare breed of people we'd love to have you onboard as a potential member of our core team. Test writers and creators of beautiful documentation will receive our maximum appreciation and support as they seek to keep up with a rapidly moving target.

Before you add a major new feature to SocketStream and submit a pull request, bear in mind our goal is to ensure the core stays lean, robust, and breathtakingly fast. Additional non-core functionality should be provided by npm modules. We'll make this possible/easier as time goes on.

If you wish to discuss an idea, or want to chat about anything else, email us at info@socketstream.org


### Credits

Thanks to Guillermo Rauch (Socket.IO), TJ Holowaychuk (Stylus, Jade), Jeremy Ashkenas (CoffeeScript), Mihai Bazon (UglifyJS) and Salvatore Sanfilippo (Redis) who's amazing work has made SocketStream possible. 


### License

SocketStream is released under the MIT license.
