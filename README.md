![SocketStream!](https://github.com/socketstream/socketstream/raw/master/new_project/public/images/logo.png)


Latest release: 0.2.1  ([view changelog](https://github.com/socketstream/socketstream/blob/master/HISTORY.md))

Twitter: [@socketstream](http://twitter.com/#!/socketstream)  
Google Group: http://groups.google.com/group/socketstream  
IRC channel: [#socketstream](http://webchat.freenode.net/?channels=socketstream) on freenode

[Read Full 0.2 Announcement](https://github.com/socketstream/socketstream/blob/master/doc/annoucements/0.2.md)


### Introduction

SocketStream is a new full stack web framework and distributed hosting platform built around the [Single-page Application](http://en.wikipedia.org/wiki/Single-page_application) paradigm. It embraces websockets, in-memory datastores (Redis), and client-side rendering to provide an ultra-responsive real time experience that will amaze your users.

While it's still early days, a lot of the functionality you need to build a good-sized real time web app is now present and relatively stable. Key functionality currently missing (most notably an elegant way to do server-side models, external authentication, an inbuilt test framework and front-end scaling) is in full-time development and will be released in stages over the coming months. All contributions gratefully received to speed up this process.

Follow [@socketstream](http://twitter.com/#!/socketstream) for the latest developments and thinking. Website coming soon.


### Features

#### General

* True bi-directional communication using websockets (or [Socket.IO 0.8](http://socket.io/) fallbacks). No more slow, messy AJAX!
* Write all code in [CoffeeScript](http://jashkenas.github.com/coffee-script/) or JavaScript - your choice
* Share code between the client and server. Ideal for business logic and model validation
* Uses [Redis](http://www.redis.io/) for fast session retrieval, pub/sub, list of users online, and any other data your app needs instantly
* Effortless, scalable, pub/sub baked right in - including Private Channels
* In-built User model - with modular internal authentication (authentication with external services e.g. Facebook Connect coming soon)
* Interactive Console - just type `socketstream console` and invoke any server-side or shared method from there
* API Trees - offer a simple, consistent way to namespace and organize large code bases
* Uses [Connect](http://senchalabs.github.com/connect/) - hook in 3rd-party middleware or write your own. Custom code executes first for maximum flexibility and speed
* Server-side Events - run custom code server-side when clients initialize or disconnect
* MIT License

#### Client Side

* Works great with Chrome, Safari __and now Firefox 6__ using native websockets
* Compatible with older versions of Firefox and IE thanks to configurable fallback transports provided by Socket.IO
* Works well on iPads and iPhones using Mobile Safari (iOS 4.2 and above), even over 3G
* Integrated asset manager - automatically packages and [minifies](https://github.com/mishoo/UglifyJS) all client-side assets
* Bundled with jQuery - though not dependent on it. Will work great with Zepto and other libraries
* Bundled with [jQuery templates](http://api.jquery.com/category/plugins/templates/) for ease - works like partials in Rails
* Easily add additional client libraries such as [Underscore.js](http://documentcloud.github.com/underscore/)
* Initial HTML sent to the browser can be written in [Jade](http://jade-lang.com/) or plain HTML
* Uses [Stylus](http://learnboost.github.com/stylus/) for CSS (works great with plain CSS too)

#### Distributed Hosting

* Out-of-the-box HTTPS support with automatic HTTP redirects
* Distributed frontend and backend architecture separated by a light-weight RPC abstraction layer 
* Allows SocketStream to run lightning-fast in a single process with no C libraries to install (ideal for Cloud9 IDE)
* When you need to scale up, easily spread the load over multiple CPU cores or additional boxes using ZeroMQ
* Near linear scalability when spreading CPU-intensive tasks over multiple backend servers (run `socketstream benchmark` to experiment)
* Front end servers can be completely isolated from Redis and your databases. They just need to talk to the box running `socketstream router`
* Internal RPC layer designed to easily support additional transports and serialization formats in the future

#### Optional Modules (will only load if enabled)

* HTTP/HTTPS API - all server-side code is automatically accessible over a high-speed request-based API
* Users Online - automatically keeps track of users online
* Plug Sockets - high-speed connections to any external server or legacy apps using ZeroMQ. Over 20 languages supported
* Rate Limiting - basic rate limiting to prevent scripted DDOS attacks

***

### How does it work?

SocketStream automatically compresses and minifies all the static HTML, CSS and client-side code your app will ever need and sends this through the first time a user visits your site.

From then on all application data is sent and received as serialized JSON objects over a websocket tunnel (or Socket.IO fallback), instantly established when the client connects and automatically re-established if broken.

All this means no more connection latency, HTTP header overhead, or clunky AJAX calls. Just true bi-directional, asynchronous, 'streaming' communication between client and server.


### What can I create with it?

SocketStream is a perfect fit for all manner of modern applications which require real-time data (chat, stock trading, location monitoring, analytics, etc). It's also a great platform for building real-time HTML5 games. However, right now it would make a poor choice for a blog or other content-rich site which requires unique URLs for search engine optimization.


### Tutorials

[Building Real-time CoffeeScript Web Applications With SocketStream](http://addyosmani.com/blog/building-real-time-coffeescript-web-applications-with-socketstream/) by [Addy Osmani](http://addyosmani.com)


### Example Apps

These apps are all in their infancy at the moment, but looking at the code is a great way to start learning SocketStream:

[SocketChat](https://github.com/addyosmani/socketchat) - simple group chat

[Dashboard](https://github.com/paulbjensen/socketstream_dashboard_example) - real-time dashboard with configurable widgets

[SocketRacer](https://github.com/alz/socketracer) - multi-player racing game


### Example 1: Basic RPC

The key to using SocketStream is the `SS` global variable which can be called anywhere within your server or client-side code.

For example, let's write a simple server-side function which squares a number. Add this to the /app/server/app.coffee file:


``` coffee-script
exports.actions =

  square: (number, cb) ->
    cb(number * number)
```

To call this from the browser add the following to the /app/client/app.coffee file:

``` coffee-script
exports.square = (number) ->
  SS.server.app.square number, (response) ->
    console.log "#{number} squared is #{response}"
```

Restart the server, refresh your page, then type this into the browser console:

``` coffee-script
SS.client.app.square(25)
```

And you will see the following output:

    25 squared is 625
    
The eagle-eyed among you will notice `SS.client.app.square(25)` actually returned `undefined`. That's fine. We're only interested in the asynchronous response sent from the server once it has processed your request. 

You can also call this server-side method using the optional HTTP API (enabled by default) with the following URL:

    /api/app/square?25                        # Hint: use .json to output to a file
    
Or even directly from the server-side console (type `socketstream console`) OR the browser's console OR another server-side file:

``` coffee-script
SS.server.app.square(25, function(x){ console.log(x) })
```
    
Note: The `console.log` callback is automatically inserted if you're calling `SS.server` methods from the browser.

You will notice by now that the `SS` variable is similar to the dollar sign $ in jQuery - it's the main way into the SocketStream API. We do our best to keep the API between client and server identical wherever possible.

Ready for something a bit more advanced? Let's take a look at reverse geocoding using HTML5 geolocation...


### Example 2: Reverse Geocoding

For the server code, create the file /app/server/geocode.coffee and paste in the following code:

``` coffee-script
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
```

To capture your location and output your address, lets's add this code in /app/client/app.coffee

``` coffee-script
# Note: the SS.client.app.init() method automatically gets called once the socket is established and the session is ready
exports.init = ->
  SS.client.geocode.determineLocation()
```

Then, purely to demonstrate client-side namespacing (see section below), let's create a new file called /app/client/geocode.coffee and paste this in:

``` coffee-script
exports.determineLocation = ->
  if navigator.geolocation
    navigator.geolocation.getCurrentPosition(success, error)
  else
    alert 'Oh dear. Geolocation is not supported by your browser. Time for an upgrade.'

# Private functions

success = (coords_from_browser) ->
  SS.server.geocode.lookup coords_from_browser, (response) ->
    console.log response
    alert 'You are currently at: ' + response.formatted_address

error = (err) ->
  console.error err
  alert 'Oops. The browser cannot determine your location. Are you online?'
```

Run this code and you should see your current location pop up (pretty accurate if you're on WiFi).
Of course, you'll need to handle the many and various errors that could go wrong during this process with a callback to the client.

**Bonus tip:** Want to run this again? Just type `SS.client.geocode.determineLocation()` in the browser console. All 'exported' client-side functions can be called this way.


### Example 3: Pub/Sub

Want to build a chat app or push an notification to a particular user?
    
First let's listen out for an event called 'newMessage' on the client:

``` coffee-script
exports.init = ->
  SS.events.on('newMessage', (message) -> alert(message))
```
          
Then, assuming we know the person's user id, we can publish the event directly to them. On the server side you'd write:

``` coffee-script
exports.actions =

  testMessage: (user_id) ->
    SS.publish.user(user_id, 'newMessage', 'Wow this is cool!')
```

Pretty cool eh? But it gets better. We don't have to worry which server instance the user is connected to. The message will always be routed to the correct server as each SocketStream server subscribes to the same instance of Redis.

Want to know how to broadcast a message to all users, or implement private channels? Take a look at the 'More Pub/Sub' section in the documentation below.


### Requirements

[Node 0.4.X](http://nodejs.org/#download) Note: SocketStream will work with Node 0.5/0.6 once [Connect](http://senchalabs.github.com/connect/) supports it

[NPM 1.0](http://npmjs.org/) (Node Package Manager) or above

[Redis 2.2](http://redis.io/) or above


### Getting Started

Ready to give it a whirl? SocketStream is published as an `npm` package easily installed with:

    sudo npm install socketstream -g

To generate a new empty SocketStream project type:

    socketstream new <name_of_your_project>

To start your app, make sure you have Redis running on your localhost, then `cd` into the directory you've just created and type:

    socketstream start
    
If all goes well you'll see the SocketStream banner coming up, then you're ready to visit your new app at:

    http://localhost:3000


## Documentation Index

All documentation is in /doc/guide/en

#### Developing your app

* [Project Directory Overview](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/developing/project_directory_overview.md)
* [Namespacing - how to organize your code using API Trees](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/developing/namespacing.md)
* [More Pub/Sub - broadcasting to everyone & Private Channels](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/developing/pub_sub.md)
* [Server-side Code - in /app/server](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/developing/server_code.md)
* [Shared Code - in /app/shared](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/developing/shared_code.md)
* [Users and Authentication](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/developing/users_and_authentication.md)
* [Environments and Configuration](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/developing/environments_and_configuration.md)
* [The @session object - getting/setting session data](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/developing/the_session_object.md)
* [The @request object - obtaining HTTP POST data and more](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/developing/the_request_object.md)
* [Server-side Events](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/developing/server-side_events.md)
* [Handling Disconnects](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/developing/handling_disconnects.md)
* [Javascript Helpers](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/developing/javascript_helpers.md)
* [Connecting to Redis](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/developing/connecting_to_redis.md)
* [Connecting to MongoDB and other DBs](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/developing/connecting_to_databases.md)
* [Custom HTTP Middleware](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/developing/custom_http_middleware.md)
* [Logging and Debugging](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/developing/logging_and_debugging.md)

#### Optional modules

These modules will only load if enabled

* [HTTP API - access /app/server methods over a super-fast JSON API](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/optional_modules/http_api.md)
* [Users Online - get a list of users online for your app](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/optional_modules/users_online.md)
* [Plug Sockets - connect to external services using ZeroMQ](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/optional_modules/plug_sockets.md)
* [Browser Check - dealing with incompatible browsers](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/optional_modules/browser_check.md)
* [Rate Limiter - very basic protection against DDOS attacks](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/optional_modules/rate_limiter.md)


#### Deploying

* [Scaling Up with ZeroMQ](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/deploying/scaling.md)
* [Using HTTPS / SSL](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/deploying/https_ssl.md)
* [Security](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/deploying/security.md)

#### Other

* [FAQs](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/faqs.md)
* [Internal RPC Spec](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/rpc_spec.md)
* [Contributing](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/contributing.md)

***

### Tests

We have begun to write tests for parts of SocketStream which are unlikely to change in the near future. Currently these live in a separate project any only cover a small number of features - but it's a start. We've chosen Jasmine so far but still need to decide how to organize the files and where to run the specs (as websocket tests are far easier to run in the browser). Once we figure this all out we'll make the tests available on Github.


### Known Issues

* New files added to /lib/client files will not be detected until you restart the server and touch one of the /lib/client files. We will fix this
* Any manipulation of $('body') using jQuery, e.g. $('body').hide(), under Firefox 4 disrupts the flashsocket connection. Until we figure out what's causing this bizarre bug, best avoid calling $('body') in your code.


### Core Team

* Owen Barnes (socketstream & owenb)
* Paul Jensen (paulbjensen)
* Alan Milford (alz)
* Addy Osmani (addyosmani)


### Credits

Thanks to Guillermo Rauch (Socket.IO), TJ Holowaychuk (Stylus, Jade), Jeremy Ashkenas (CoffeeScript), Mihai Bazon (UglifyJS), Isaac Schlueter (NPM), Salvatore Sanfilippo (Redis), Justin Tulloss (Node ZeroMQ bindings) and the many others who's amazing work has made SocketStream possible. Special thanks to Ryan Dahl (creator of node.js) for the inspiration to do things differently.


### Thanks!

SocketStream is kindly sponsored by AOL.


### License

SocketStream is released under the MIT license.
