![SocketStream!](https://github.com/socketstream/socketstream/raw/master/lib/generator_files/logo.png)


SocketStream makes it a breeze to build phenomenally fast, highly-scalable real-time web applications on Node.js.

Latest release: 0.0.36   ([view changelog](https://github.com/socketstream/socketstream/blob/master/HISTORY.md))


### Features

* True bi-directional communication using websockets (or flash sockets)
* Crazy fast! Starts up instantly. No HTTP handshaking/headers/routing to slow you down
* Works on all major browsers thanks to the excellent [Socket.IO](http://socket.io/)
* Write client and server code in [Coffeescript](http://jashkenas.github.com/coffee-script/) or Javascript - your choice
* Easily share code between the client and server. Ideal for business logic and model validation
* Automatic HTTP API. All server-side code is also accessible over a high-speed request-based API
* Effortless, scalable, pub/sub baked right in. See examples below
* Integrated asset manager. Automatically packages and [minifies](https://github.com/mishoo/UglifyJS) your client-side code
* Experimental out-of-the-box HTTPS support. See section below.
* In-built User model with modular authentication
* Uses [Redis](http://www.redis.io/) for fast session retrieval, pub/sub, list of users online, and any other data your app needs instantly
* Nested namespaces and functions allow building of large 'enterprise' apps
* Interactive console - just type 'socketstream console' and invoke any server-side method from there
* Bundled with jQuery 1.5.2. Easily add additional client libraries such as [Underscore.js](http://documentcloud.github.com/underscore/)
* Easily create jQuery templates using the [official plugin](http://api.jquery.com/category/plugins/templates/). Works like partials in Rails.
* Uses [Jade](http://jade-lang.com/) to render static HTML
* Uses [Stylus](http://learnboost.github.com/stylus/) for CSS
* MIT Licence


### Introduction

SocketStream is a new full stack web framework built around the [Single-page Application](http://en.wikipedia.org/wiki/Single-page_application) paradigm. It embraces websockets, in-memory datastores (Redis), and client-side rendering to provide an ultra-responsive experience that will amaze your users.

Project status: Highly experimental but usable. Improving almost every day.

A request: I wish to keep SocketStream under-the-radar for now whilst I build a public website for it and, most importantly, figure out a good way to test the code (now the API has settled down somewhat). If you've discovered this project and wish to contribute, that would be awesome! But please don't tweet about it or post it on Hacker News just yet. Thank you.


### How does it work?

SocketStream automatically compresses and minifies all the static HTML, CSS and client-side code your app will ever need and sends this through the first time a user visits your site.

From then on all application data is sent and received as serialized JSON objects over a websocket (or 'flash socket') tunnel, instantly established when the client connects and automatically re-established if broken.

All this means no more connection latency, HTTP header overhead, or slow AJAX calls. Just true bi-directional, asynchronous, 'streaming' communication between client and server.

Note: While SocketStream is a perfect fit for all manner of modern applications which require real-time data (chat, stock trading, location monitoring, analytics, etc), it would make a poor choice for a blog or other content-rich site which requires unique URLs for search engine optimization.


### Quick Example

The key to using SocketStream is the `remote` method which is available anywhere within the client app.

For example, let's square a number on the server:

On the client side, add this to the /app/client/app.coffee file:

    window.app =
    
      square: (number) ->
        remote 'app.square', number, (response) ->
          console.log "#{number} squared is #{response}"

And on the server, add this to /app/server/app.coffee

    exports.actions =

      square: (number, cb) ->
        cb(number * number)

Refresh your page then type this into the browser console:

    app.square(25)

And you will see the following output:

    25 squared is 625

You can also call this server-side method over HTTP with the following URL:

    /api/app/square?25                            (Hint: use .json to output to a file)
    
Or even from the console (type 'socketstream console') or another server-side file using:

    $SS.server.app.square(25, console.log)        (Hint: passing console.log as the callback prints the response in the terminal)

Ready for something a bit more advanced? Let's take a look at reverse geocoding using HTML5 geolocation...


### Reverse Geocoding Example

For the server code, create the file /app/server/geocode.coffee and paste in the following code:

    exports.actions =

      lookup: (coords_from_browser, cb) ->
        host = 'maps.googleapis.com'
        r = coords_from_browser.coords
        http = require('http')
        google = http.createClient(80, host)
        google.on 'error', (e) -> console.error "Unable to connect to #{host}"
        request = google.request 'GET', "/maps/api/geocode/json?sensor=true&latlng=#{r.latitude},#{r.longitude}"
        request.end()
        request.on 'error', (e) -> console.error "Unable to parse response from #{host}"
        request.on 'response', (response) => parseResponse(response, cb)

    parseResponse = (response, cb) ->  # note: private methods are written outside of exports.actions
      output = ''
      response.setEncoding('utf8')
      response.on 'data', (chunk) -> output += chunk
      response.on 'end', ->
        j = JSON.parse(output)
        result = j.results[0]
        cb(result)


To capture your location and output your address, lets's add this code in /app/client/app.coffee

    window.app =
    
      init: ->
        # Note: the app.init method automatically gets called once the socket is established and the session is ready
        app.geocode.determineLocation()


Then, purely to demonstrate a nice way to do client-side namespacing, let's create a new file called /app/client/geocode.coffee and paste this in:

    app.geocode =

      determineLocation: ->
        if navigator.geolocation
          navigator.geolocation.getCurrentPosition(success, error)
        else
          alert 'Oh dear. Geolocation is not supported by your browser. Time for an upgrade.'

    # Private functions

    success = (coords_from_browser) ->
      remote 'geocode.lookup', coords_from_browser, (response) ->
        console.log response
        alert 'You are currently at: ' + response.formatted_address

    error = (err) ->
      console.error err
      alert 'Oops. The browser cannot determine your location. Are you online?'

Run this code and you should see your current location pop up (pretty accurate if you're on WiFi).
Of course, you'll need to handle the many and various errors that could go wrong during this process with a callback to the client.

**Bonus tip:** Want to run this again? Just type 'app.geocode.determineLocation()' from the browser console. All client-side functions can be called this way.


### Pub/Sub Example

Want to build a chat app or push an notification to a particular user?
    
First let's listen out for an event called 'newMessage' on the client:

    window.app =

      init: ->
        $SS.events.on('newMessage', (message) -> alert(message))
          
Then, assuming we know the person's user_id, we can publish the event directly to them. On the server side you'd write:

    exports.actions =

      testMessage: (user_id) ->
        $SS.publish.user(user_id, 'newMessage', 'Wow this is cool!')

Pretty cool eh? But it gets better. We don't have to worry which server instance the user is connected to. The message will always be routed to the correct server as each SocketStream server subscribes to the same instance of Redis.

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

    sudo npm link

To generate a new empty SocketStream project, simply type:

    socketstream new <name of your project>

The directories generated will be very familiar to Rails users. Here's a brief overview:

#### /app/client
* All files within /app/client will be converted to Javascript and sent to the client
* The app.init() function will be automatically called once the websocket connection is established
* All client code can be called from the console using the 'app' variable
* If you have a Javascript library you wish to use (e.g. jQuery UI), put this in /lib/client instead
* Nesting client files within folders is supported, however they are not automatically namespaced for you - yet!
* The /app/client/app.coffee file must always be present
* View incoming/outgoing calls in the browser console in development (controlled with $SS.config.client.log.level)
* Coffeescript client files are automatically compiled and served on-the-fly in development mode and pre-compiled/minified/cached in staging and production

#### /app/server
* All files in this directory behave similar to Controllers in traditional MVC frameworks
* For example, to call app.init from the client and pass 25 as params, call remote('app.init',25,function(){ alert(this); }) in the client
* All methods can be automatically accessed via the in-built HTTP API (e.g. /api/app/square.json?5)
* All server methods are pre-loaded and accessible via $SS.server in the console or from other server-side files
* If the method takes incoming params (optional), these will be pushed into the first argument. The last argument must always be the callback (cb)
* All publicly available methods should be listed under 'exports.actions'. Private methods must be placed outside this scope and begin 'methodname = (params) ->'
* Server files can be nested. E.g. remote('users.online.yesterday') would reference the 'yesterday' method in /app/server/users/online.coffee
* You may also nest objects within objects to provide namespacing within the same file
* @session gives you direct access to the User's session
* @user gives you direct access to your custom User instance. More on this coming soon

#### /app/shared
* All files within /app/shared will be converted to Javascript and sent to the client. In addition they can also be called server-side
* Ideal for business logic and models that need to validate on the client (for speed) yet ensure integrity before saving to the DB
* Start your file with the same header you would for a server file. E.g. class exports.Filter
* Use it client-side by instantiating the class: filter = new exports.Filter
* All shared methods are pre-loaded and accessible via $SS.shared in the console or from other server-side files
* WARNING: All code within this folder will be sent to the client. Do not include any proprietary secret sauce or use database/filesystem calls

#### /app/css
* /app/css/app.stly must exist. This should contain your stylesheet code in [Stylus](http://learnboost.github.com/stylus/) format (similar to SASS)
* Additional Stylus files can be imported into app.stly using @import 'name_of_file'. Feel free to nest files if you wish.
* If you wish to use CSS libraries within your project (e.g. reset.css or jQuery UI) put these in /lib/css instead
* Stylus files are automatically compiled and served on-the-fly in development mode and pre-compiled/compressed/cached in staging and production

#### /app/views
* /app/views/app.jade must exist. This should contain all the static HTML your app needs in [Jade](http://jade-lang.com/) format (similar to HAML)
* The HTML HEAD tag must contain '!= SocketStream'. This helper ensures all the correct libraries are loaded depending upon the environment (declared by SS_ENV)
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


### Configuration Files

SocketStream runs in __development__ mode by default, outputting all incoming and outgoing requests to the terminal, displaying all server-side exceptions in the browser console, and compiling all client assets on the fly in order to aid debugging.

Two other 'preset' environments are available: __staging__ and __production__. Both will load SocketStream with sensible defaults for their intended use.

Preset variables can be overwritten and augmented by two optional files if required: an application-wide config file placed in /config/app.json, and an environment-specific file placed in /config/environments/<SS_ENV>.json (e.g. /config/environments/development.json)

Use the SS_ENV environment variable to start SocketStream in a different environment. E.g:

    SS_ENV=staging socketstream start
    
All default modes are fully configurable using an optional JSON file placed within /config/environments. An unlimited number of new environments may also be added. You can easily tell which environment in running by calling $SS.env in the server or client.

We will publish a full list of configurable params in the near future, but for now these can be viewed (and hence overridden in the config file), by typing $SS.config in the SocketStream console.


### Logging

Client and server-side logging is switched on by default in __development__ and __staging__ and off in __production__. It can be controlled manually via $SS.config.log.level and $SS.config.client.log.level. Four levels of logging are available ranging from none (0) to highly verbose (4). The default level is 3.

Occasionally you'll want to 'silence' some requests to the server which are called repeatedly (e.g. confirming a user is online) in order to see the wood from the trees. Add the 'silent' option to your 'remote' commands, e.g.

    remote('user.confirm_online', user_id, {silent: true})


### Connecting to Redis

Redis is automatically accessible anywhere within your server-side code using the R global variable. E.g.

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


### HTTPS / SSL

HTTPS support is currently highly experimental and hence is switched off by default.

Our eventual goal is to make SocketStream run in HTTPS mode by default, using self-signed certificates (included within SocketStream) if commercial ones are not provided.

To turn on HTTPS make sure you have the openssl library headers on your system before you ./configure the Node source code.

On Ubuntu you can install them with:

    sudo apt-get install libssl-dev openssl

Hint: You may need to install/run pkg-config after doing this.

Once Node has been compiled with TLS/HTTPS support, turn it on by creating a /config/environments/development.json file and putting this inside:

    {
      "ssl": {"enabled": true}
    }
    
Note: We have found Safari will not support secure websockets without a valid (i.e. not a self-signed) certificate. If you wish to experiment with HTTPS whilst developing we recommend using Chrome at the moment.

We will continue enhancing the HTTPS experience over future releases until it's stable.


### Sessions

SocketStream creates a new session when a browser connects to the server for the first time, storing a session cookie on the client and the details in Redis. When the same visitor returns (or presses refresh in the browser), the session is instantly retrieved.

The current session object is 'injected' into exports.actions within the server-side code and hence can be accessed using the @session variable. E.g.

    exports.actions =
    
      getInfo: (cb) ->
        cb("This session was created at #{@session.created_at}")


### Users and Modular Authentication

As almost all web applications have users which need to sign in and out, we have built the concept of a 'current user' into the core of SocketStream. This not only makes life easier for developers, but is vital to the correct functioning of the pub/sub system and authenticating API requests.

Authentication is completely modular and trivial for developers to implement. Here's an example of a custom authentication module we've placed in /lib/server/custom_auth.coffee

    exports.authenticate = (params, cb) ->
      success = # do DB/third-party lookup
      if success
        cb({success: true, user_id: 21323, info: {username: 'joebloggs'}})
      else
        cb({success: false, info: {num_retries: 2}})

* Notice the first argument takes incoming params from the client, normally in the form of {username: 'something', password: 'secret'} but it could also contain a biometric ID, iPhone device ID, SSO token, etc.

* The second argument is the callback. This must return an object with a 'status' attribute (boolean) and a 'user_id' attribute (number or string) if successful. Additional info, such as number of tries remaining etc, can optionally be passed back within the object and pushed upstream to the client if desired.

To use this custom authentication module within your app, you'll need to call @session.authenticate in your /app/server code, passing the name of the module you've just created as the first argument:

    exports.actions =
    
      authenticate: (params, cb) ->
        @session.authenticate 'custom_auth', params, (response) =>
          @session.setUserId(response.user_id) if response.success       # sets @session.user_id and initiates pub/sub
          cb(response)                                                   # sends additional info back to the client

      logout: (cb) ->
        @session.logout(cb)                                              # disconnects pub/sub and returns a new Session object


This modular approach allows you to offer your users multiple ways to authenticate. It also means you can pass the name of a NPM module for common authentication needs like Facebook Connect.

__Important__

Mark any files within /app/server which require authentication by placing this line at the top:

    exports.authenticate = true

This will check or prompt for a logged in user before and of the methods within that file are executed.


### HTTP API

The HTTP API allows all server-side actions to be accessed over a traditional HTTP request-based interface.

It is enabled by default and can be configured with the following config variables:

    $SS.config.api.enabled            Boolean       default: true         # Enables/disables the HTTP API
    $SS.config.api.prefix             String        default: 'api'        # Sets the URL prefix (e.g. http://mysite.com/api

The HTTP API also supports Basic Auth (which will run over HTTPS if enabled), allowing you to access methods which use @session.user_id or @user.

By placing 'exports.authenticate = true' in the file (see above) the server will know to prompt for a username and password before allowing access any of the actions within that file. However, the API will need to know which module to authenticate against. Set the $SS.config.api.auth.basic.module_name variable by putting the following JSON in your config file:
    
    {
      "api": { "auth": { "basic": { "module_name": "custom_auth"} } }
    }

Note: Basic Auth will pass the 'username' and 'password' params to your exports.authenticate function.


### Handling Disconnects

Both websocket and 'flashsocket' tunnels are surprisingly resilient to failure; however, as developers we must always assume the connection will fail from time to time, especially as the client may be on an unstable mobile connection.

Therefore we recommend binding a function to the 'disconnect' and 'connect' events within the SocketIO client. For example:

    $SS.socket.on('disconnect', -> alert('Connection Down'))
    
    $SS.socket.on('connect', -> alert('Connection Up'))

These events can be used client-side to toggle an online/offline icon within the app, or better still, to dim the screen and show a 'Attempting to reconnect...' message to users.

At present requests sent to the server whist offline are queued on the browser and automatically executed once the connection is re-established. In the near future we will allow time-critical requests to be marked as such - essential for stock trading apps.


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

We welcome contributions from forward-thinking hackers keen to redefine what's possible on the web. Big, bold ideas, unconstrained by frameworks and concepts from the past will always be welcome.

The best developers take 10 lines of code and come up with a completely new design that needs 3. If you're one of these rare breed of people we'd love to have you onboard as a potential member of our core team. Test writers and creators of beautiful documentation will receive our maximum appreciation and support as they seek to keep up with a rapidly moving target.

Before you add a major new feature to SocketStream and submit a pull request, bear in mind our goal is to ensure the core stays lean, robust, and breathtakingly fast. Additional non-core functionality should be provided by npm modules. We'll make this possible/easier as time goes on.

If you wish to discuss an idea, or want to chat about anything else, email us at info@socketstream.org


### Credits

Thanks to Guillermo Rauch (Socket.IO), TJ Holowaychuk (Stylus, Jade), Jeremy Ashkenas (CoffeeScript), Mihai Bazon (UglifyJS), Isaac Schlueter (NPM), Salvatore Sanfilippo (Redis) and the many others who's amazing work has made SocketStream possible. 


### License

SocketStream is released under the MIT license.
