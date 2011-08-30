![SocketStream!](https://github.com/socketstream/socketstream/raw/master/new_project/public/images/logo.png)


Latest release: 0.2 beta 2   ([view changelog](https://github.com/socketstream/socketstream/blob/master/HISTORY.md))

Twitter: [@socketstream](http://twitter.com/#!/socketstream)  
Google Group: http://groups.google.com/group/socketstream  
IRC channel: [#socketstream](http://webchat.freenode.net/?channels=socketstream) on freenode


### Version 0.2 Branch

Note: You're looking at the 0.2 beta release branch. Although not completely finished yet, if you don't mind living on the edge we now advise using 0.2 for development. We're on track to get the first stable release, 0.2.0, finished and pushed to NPM before the end of August.

Install the 0.2 beta by cloning the 0.2 branch from github and running 'sudo npm install -g' inside the directory.  
At present SocketStream 0.2 __only works with Node 0.4__ but will support Node 0.5 as soon as Connect does.

[Read Full 0.2 Announcement](https://github.com/socketstream/socketstream/blob/master/doc/annoucements/0.2.md)


### Introduction

SocketStream is a new full stack web framework and distributed hosting platform built around the [Single-page Application](http://en.wikipedia.org/wiki/Single-page_application) paradigm. It embraces websockets, in-memory datastores (Redis), and client-side rendering to provide an ultra-responsive real time experience that will amaze your users.

If you've used Rails or similar frameworks in the past you'll instantly feel at home with SocketStream. While it's still early days, a lot of the functionality you need to build a good-sized real time web app is now present and relatively stable.

Key functionality which is currently missing (most notably an elegant way to do server-side models, authentication, inbuilt test framework and front-end scaling) are in full-time development and will be released in stages over the coming months. All contributions gratefully received to speed up this process.

Follow [@socketstream](http://twitter.com/#!/socketstream) for the latest developments and thinking. Website coming soon.


### Features

#### General

* True bi-directional communication using websockets (or Socket.IO fallbacks). No more slow, messy AJAX!
* Write all code in [CoffeeScript](http://jashkenas.github.com/coffee-script/) or JavaScript - your choice
* Share code between the client and server. Ideal for business logic and model validation
* Uses [Redis](http://www.redis.io/) for fast session retrieval, pub/sub, list of users online, and any other data your app needs instantly
* Plug Sockets - high-speed connections to any external server or legacy apps using ZeroMQ. Over 20 languages supported
* Effortless, scalable, pub/sub baked right in - including Private Channels. See examples below
* In-built User model - with modular authentication. Automatically keeps track of users online (see below)
* Interactive Console - just type 'socketstream console' and invoke any server-side or shared method from there
* API Trees - offer a simple, consistent way to namespace and organize large code bases
* Uses [Connect](http://senchalabs.github.com/connect/) - hook in 3rd-party middleware or write your own. Custom code executes first for maximum flexibility and speed
* Server-side Events - run custom code server-side when clients initialize or disconnect
* Modular architecture - any feature you don't need (such as HTTP API) can be disabled in the config and won't be loaded
* MIT License

#### Client Side

* Works great with Chrome and Safari. Firefox and IE support temperamental but improving thanks to [Socket.IO 0.7](http://socket.io/)
* HTTP/HTTPS API - all server-side code is automatically accessible over a high-speed request-based API
* Integrated asset manager - automatically packages and [minifies](https://github.com/mishoo/UglifyJS) all client-side assets
* Works well on iPads and iPhones using Mobile Safari (iOS 4.2 and above), even over 3G
* Bundled with jQuery - though not dependent on it. Will work great with Zepto and other libraries
* Bundled with [jQuery templates](http://api.jquery.com/category/plugins/templates/) - works like partials in Rails
* Easily add additional client libraries such as [Underscore.js](http://documentcloud.github.com/underscore/)
* Initial HTML sent to the browser can be written in [Jade](http://jade-lang.com/) or plain HTML
* Uses [Stylus](http://learnboost.github.com/stylus/) for CSS (works great with plain CSS too)

#### Distributed Hosting

* Distributed frontend and backend architecture separated by a light-weight RPC abstraction layer 
* Allows SocketStream to run lightning-fast in a single process with no C libraries to install (ideal for Cloud9 IDE)
* When you need to scale up, easily spread the load over multiple CPU cores or additional boxes using ZeroMQ
* Near linear scalability when spreading CPU-intensive tasks over multiple backend servers (run 'socketstream benchmark' to experiment)
* Front end servers can be completely isolated from Redis and your databases. They just need to talk to a box running 'socketstream router'
* RPC layer designed to easily support additional transports and serialization formats in the future
* Out-of-the-box HTTPS support with auto HTTP redirects. See HTTPS section below


### How does it work?

SocketStream automatically compresses and minifies all the static HTML, CSS and client-side code your app will ever need and sends this through the first time a user visits your site.

From then on all application data is sent and received as serialized JSON objects over a websocket (or 'flashsocket') tunnel, instantly established when the client connects and automatically re-established if broken.

All this means no more connection latency, HTTP header overhead, or clunky AJAX calls. Just true bi-directional, asynchronous, 'streaming' communication between client and server.


### What can I create with it?

SocketStream is a perfect fit for all manner of modern applications which require real-time data (chat, stock trading, location monitoring, analytics, etc). However, right now it would make a poor choice for a blog or other content-rich site which requires unique URLs for search engine optimization.


### Tutorials

[Building Real-time CoffeeScript Web Applications With SocketStream](http://addyosmani.com/blog/building-real-time-coffeescript-web-applications-with-socketstream/) by [Addy Osmani](http://addyosmani.com)


### Example Apps

These apps are all in their infancy at the moment, but looking at the code is a great way to start learning SocketStream:

[SocketChat](https://github.com/addyosmani/socketchat) - simple group chat

[Dashboard](https://github.com/paulbjensen/socketstream_dashboard_example) - real-time dashboard with configurable widgets

[SocketRacer](https://github.com/alz/socketracer) - multi-player racing game


### Quick Example

The key to using SocketStream is the 'SS' global variable which can be called anywhere within your server or client-side code.

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
    
The eagle-eyed among you will notice SS.client.app.square(25) actually returned 'undefined'. That's fine. We're only interested in the asynchronous response sent from the server once it has processed your request. 

You can also call this server-side method using the built-in HTTP API with the following URL:

    /api/app/square?25                        # Hint: use .json to output to a file
    
Or even directly from the server-side console (type 'socketstream console') OR the browser's console OR another server-side file:

``` coffee-script
SS.server.app.square(25, function(x){ console.log(x) })
```
    
Note: The 'console.log' callback is automatically inserted if you're calling SS.server methods from the browser.

You will notice by now that the 'SS' variable is similar to the dollar sign $ in jQuery - it's the main way into the SocketStream API. We do our best to keep the API between client and server identical wherever possible.

Ready for something a bit more advanced? Let's take a look at reverse geocoding using HTML5 geolocation...


### Reverse Geocoding Example

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

**Bonus tip:** Want to run this again? Just type 'SS.client.geocode.determineLocation()' in the browser console. All 'exported' client-side functions can be called this way.


### Pub/Sub Example

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

Want to know how to broadcast a message to all users, or implement private channels? Take a look at the 'More Pub/Sub' section below.


### Requirements

[Node 0.4](http://nodejs.org/#download) or above (Node 0.5/0.6 once Connect supports it)

[NPM 1.0](http://npmjs.org/) (Node Package Manager) or above

[Redis 2.2](http://redis.io/) or above


### Getting Started

Ready to give it a whirl? SocketStream is highly experimental at the moment, but we're using it in new projects and improving it every day.

SocketStream is now published as an NPM package. This can easily be installed with:

    sudo npm install socketstream -g

To generate a new empty SocketStream project, simply type:

    socketstream new <name_of_your_project>

The directories generated will be very familiar to Rails users. Here's a brief overview:

#### /app/client
* All files within /app/client will be sent to the client. CoffeeScript files will automatically be converted to JavaScript
* If you have a JavaScript library you wish to use (e.g. jQuery UI), put this in /lib/client instead
* View incoming/outgoing calls in the browser console in development mode
* The SS.client.app.init() function will be automatically called once the websocket connection is established
* Hence the /app/client/app.coffee (or app.js) file must always be present
* Nesting client files within multiple folders is supported. See section below on Namespacing

#### /app/server
* All files in this directory behave similar to Controllers in traditional MVC frameworks
* For example, to call app.init from the client and pass 25 as params, call SS.server.app.init(25) in the client
* All methods can be automatically accessed via the built-in HTTP API (e.g. /api/app/square.json?5)
* All server methods are pre-loaded and accessible via SS.server in the console or from other server-side files
* If the method takes incoming params (optional), these will be pushed into the first argument. The last argument must always be the callback (cb)
* All publicly available methods should be listed under 'exports.actions'. Private methods must be placed outside this scope and begin 'methodname = (params) ->'
* Server files can be nested. E.g. SS.server.users.online.yesterday() would call the 'yesterday' method in /app/server/users/online.coffee
* You may also nest objects within objects to provide namespacing within the same file
* @session gives you direct access to the User's session
* @request gives you meta data regarding the RPC call (includes any HTTP POST data if present)

#### /app/shared
* See 'Sharing Code' section below

#### /app/css
* /app/css/app.styl must exist. This should contain your stylesheet code in [Stylus](http://learnboost.github.com/stylus/) format (similar to SASS)
* Additional Stylus files can be imported into app.styl using @import 'name_of_file'. Feel free to nest files if you wish.
* If you wish to use CSS libraries within your project (e.g. normalize.css or jQuery UI) put these in /lib/css instead, or feel free to link to hosted CDN files in /app/views/app/jade
* Stylus files are automatically compiled and served on-the-fly in development mode and pre-compiled/compressed/cached in staging and production

#### /app/views
* Either /app/views/app.jade or /app/views/app.html must exist. This should contain all the static layout HTML your app will ever need.
* Use [Jade](http://jade-lang.com/) format (similar to HAML) if you wish (recommended to ensure valid HTML syntax)
* The HTML HEAD tag must contain '!= SocketStream' in Jade, or '<SocketStream>' in plain HTML. This helper ensures all the correct libraries are loaded depending upon the environment (declared by SS_ENV)
* Easily nest additional HTML as jQuery templates (similar to Rails partials) in either Jade or plain HTML. E.g /app/views/people/customers/info.jade is accessible as $("#people-customers-info").tmpl(myData).
* Views and templates are automatically compiled and served on-the-fly in development and pre-compiled/compressed/cached in staging and production

#### /lib
* Changes to files within /lib/client or /lib/css automatically triggers re-compilation/packing/minification of client assets
* New files added to these directories are not currently recognised (hence a server restart is needed). We will fix this soon
* Easily control the order your client libraries are loaded by prefixing them with a number (e.g. 1.jquery.js, 2.jquery-ui.js)
* Client JS files are automatically minified by [UglifyJS](https://github.com/mishoo/UglifyJS) unless the filename contains '.min'

#### /public
* Store your static files here (e.g. /public/images, robots.txt, etc)
* The /index.html file and /public/assets folder are managed by SocketStream and should not be touched


Before starting up your new app, make sure you have Redis 2.2+ running on your localhost, then type:

    socketstream start
    
If all goes well you'll see the SocketStream banner coming up, then you're ready to start!


### Configuration Files

SocketStream runs in __development__ mode by default, outputting all incoming and outgoing requests to the terminal, displaying all server-side exceptions in the browser console, and compiling all client assets on the fly in order to aid debugging.

Two other 'preset' environments are available: __staging__ and __production__. Both will load SocketStream with sensible defaults for their intended use.

Preset variables can be overwritten and augmented by two optional files if required: an application-wide config file placed in /config/app.coffee, and an environment-specific file placed in /config/environments/<SS_ENV>.coffee (e.g. /config/environments/development.coffee) which will override any values in app.coffee.

Use the SS_ENV environment variable to start SocketStream in a different environment. E.g:

    SS_ENV=staging socketstream start
    
An unlimited number of new environments may also be added. You can easily tell which environment in running by typing SS.env in the server or client.

Our forthcoming website will detail the full list of configurable params, but for now these can be viewed (and hence overridden in the config file), by typing SS.config in the SocketStream console.

Throughout this README you'll see repeated references to config variables which look something like this:

    SS.config.limiter.enabled = true

In this case, you could change the value of the variable by adding the following to your config file:

``` coffee-script
exports.config =
  limiter: 
    enabled: true
```

### Logging

Client and server-side logging is switched on by default in __development__ and __staging__ and off in __production__. It can be controlled manually via SS.config.log.level and SS.config.client.log.level. Four levels of logging are available ranging from none (0) to highly verbose (4). The default level is 3.

Occasionally you'll want to 'silence' some requests to the server which are called repeatedly (e.g. sending location data) in order to see the wood from the trees. Add the 'silent' option to your SS.server commands, e.g.

``` coffee-script
SS.server.user.updatePosition(latestPosition, {silent: true})
```

### Connecting to Redis

Redis is automatically accessible anywhere within your server-side code using the R global variable. E.g.

``` coffee-script
    R.set("string key", "string val")

    R.get("string key", (err, data) -> console.log(data))    # prints 'string val'
```

The Redis host, port and database/keyspace index are all configurable via the SS.config.redis params. You may wish to set a different SS.config.redis.db_index for your development/staging/production environments to ensure data is kept separate.

All internal SocketStream keys and pub/sub channels are prefixed with 'ss:', so feel free to use anything else in your application.

[View full list of commands](http://redis.io/commands)


### Connecting to Databases

Building a great DB connection framework is very much a focus for a future releases, but this is how we're connecting to mongoDB today:

The /config/db.coffee (or .js) file is loaded automatically at startup (if present). So you can do something like this:

``` coffee-script
mongodb = require('mongodb')   # installed by NPM
Db = mongodb.Db
Connection = mongodb.Connection
Server = mongodb.Server
global.M = new Db('my_database_name', new Server('localhost', 27017))
M.open (err, client) -> console.error(err) if err?
```
This would allow you to access mongoDB from the M global variable.

As this file is loaded after the environment config is processed, you can put your db connection params in /config/environments/development.coffee

``` coffee-script
exports.config =
  db:
    mongo:
      database:     "my_database_name"
      host:         "localhost"
      port:         27017
```

Then access them inside /config/db.coffee as so:

``` coffee-script
config = SS.config.db.mongo
global.M = new Db(config.database, new Server(config.host, config.port))
```

We've not tested SocketStream with CouchDB, MySQL, or any other DB, but the principals should be the same.


### Namespacing (Client and Shared code)

One of the trickiest problems to solve in this new exciting world of rich JavaScript-based web apps is where to put all of those files and how to organise them as your project grows.

SocketStream's novel approach is to turn all your Client and Shared files into an 'API tree' which can be called from a global variable (SS.client and SS.shared respectively). Server code works slightly differently but essentially follows the same API Tree approach (in this case for SS.server).

The rule is simple: Every object, function and variable will automatically remain private inside your file unless you prefix it with 'exports.'. Once you do, it will be added to the API tree and can be easily referenced or invoked from any file in the same environment.

For example, let's create a file called /app/client/navbar.coffee and paste the following in it:

``` coffee-script
areas = ['Home', 'Products', 'Contact Us']

exports.draw = ->
  areas.forEach (area) ->
    render(area)
    console.log(area + ' has been rendered')

render = (area) ->
  $('body').append("<li>#{area}</li>")
```
    
In this case the 'draw' method has been made public and can now be executed by calling SS.client.navbar.draw() from anywhere in your client code, or directly in the browser's console. The 'areas' variable and 'render' function both remain private within that file (thanks to closures) and will never pollute the global namespace.

Nested namespaces using multiple folders and deep object trees are fully supported. SocketStream does a quick check when it starts up to ensure file and folder names don't conflict in the same branch. We think API trees are one of the coolest features of SocketStream. Let us know what you think.

**Tip** If you'd like to save on keystrokes, feel free to alias SS.client with something shorter. E.g:

``` coffee-script
window.C = SS.client

C.navbar.draw()
```

### Sharing Code

One of the great advantages SocketStream provides is the ability to share the same JavaScript/CoffeeScript code between client and server. Of course you can always copy and paste code between files, but we provide a more elegant solution:

Shared code is written and namespaced in exactly the same way as Client code, but it is designed to run in both environments. Simply add a new file within /app/shared and export the functions, properties, objects or even CoffeeScript classes you wish to share.

For example, let's create a file called /app/shared/calculate.coffee and paste the following in it:

``` coffee-script
exports.circumference = (radius = 1) ->
  2 * estimatePi() * radius

estimatePi = -> 355/113
```    

This can now be executed by calling SS.shared.calculate.circumference(20) from anywhere within your server OR client code! This makes /app/shared the ideal place to write calculations, formatting helpers and model validations - among other things. Just remember never to reference the DOM, any back-end DBs or Node.js libraries as this code needs to remain 'pure' enough to run on both the server or browser.

All Shared code is pre-loaded and added to the SS.shared API tree which may be inspected at any time from the server or browser's console. You'll notice estimatePi() does not appear in the API tree as this is a private function (although the code is still transmitted to the client).

**Warning** All code within /app/shared will be compressed and transmitted to the client upon initial connection. So make sure you don't include any proprietary secret sauce or use any database/filesystem calls.


### Helpers

SocketStream comes with a number of JavaScript prototype helper methods, created automatically when you make a new project. The concept is very similar to ActiveSupport in Rails.

The default helpers we ship with are also used server-side throughout SocketStream. Hence you can use them in client, shared and server code and expect the same result, no matter where the code executes.

Take a look at /lib/client/3.helpers.js to see the available helpers. If for some reason these conflict with a third-party library, or you simply don't want to use them, just delete this file and it won't come back.


### Users and Modular Authentication

As almost all web applications have users which need to sign in and out, we have built the concept of a 'current user' into the core of SocketStream. This not only makes life easier for developers, but is vital to the correct functioning of the pub/sub system, authenticating API requests, and tracking which users are currently online (see section below).

Authentication is completely modular and trivial for developers to implement. Here's an example of a custom authentication module we've placed in /lib/server/custom_auth.coffee

``` coffee-script
exports.authenticate = (params, cb) ->
  success = # do DB/third-party lookup
  if success
    cb({success: true, user_id: 21323, info: {username: 'joebloggs'}})
  else
    cb({success: false, info: {num_retries: 2}})
```

* Notice the first argument takes incoming params from the client, normally in the form of {username: 'something', password: 'secret'} but it could also contain a biometric ID, iPhone device ID, SSO token, etc.

* The second argument is the callback. This must return an object with a 'status' attribute (boolean) and a 'user_id' attribute (number or string) if successful. Additional info, such as number of tries remaining etc, can optionally be passed back within the object and pushed upstream to the client if desired.

To use this custom authentication module within your app, you'll need to call @session.authenticate in your /app/server code, passing the name of the module you've just created as the first argument:

``` coffee-script
exports.actions =

  authenticate: (params, cb) ->
    @session.authenticate 'custom_auth', params, (response) =>
      @session.setUserId(response.user_id) if response.success       # sets session.user.id and initiates pub/sub
      cb(response)                                                  # sends additional info back to the client

  logout: (cb) ->
    @session.user.logout(cb)                                        # disconnects pub/sub and returns a new Session object
```

This modular approach allows you to offer your users multiple ways to authenticate. In the future we will also be supporting common authentication services like Facebook Connect.

__Important__

Mark any files within /app/server which require authentication by placing this line at the top:

``` coffee-script
exports.authenticate = true
```

This will check or prompt for a logged in user before any of the methods within that file are executed.

Once a user has been authenticated, their User ID is accessible by calling @session.user_id anywhere in your /app/server code.


### Tracking Users Online

Once users are able to authenticate and log in, you'll probably want to keep track of who's online - especially if you're creating a real-time chat or social app. Luckily we've built this feature right into the framework.

When a user successfully authenticates (see section above) we store their User ID within Redis. You may obtain an array of User IDs online right now by calling this method in your server-side code:

``` coffee-script
SS.users.online.now (data) -> console.log(data)
```

If a user logs out, they will immediately be removed from this list. But what happens if a user simply closes down their browser or they lose their connection?

By default the SocketStream client sends an ultra-lightweight 'heartbeat' signal to the server every 30 seconds confirming the user is still online. On the server side, a process runs every minute to ensure users who have failed to check in within the last minute are 'purged' from the list of users online. All timings can be configured using SS.config.client.heartbeat_interval and the SS.config.users.online params.

Note: The 'Users Online' feature is enabled by default as the overhead is minimal. If you don't need this feature you can easily disable it by setting SS.config.users.online.enabled to false in the app config file.


### More Pub/Sub

In addition to the SS.publish.user() method documented above, there are two additional publish commands which allow you to easily message users in bulk.

To send a notification to all users (for example to let everyone know the system is going down for maintenance), use the broadcast method:

``` coffee-script
SS.publish.broadcast('flash', {type: 'notification', message: 'Notice: This service is going down in 10 minutes'})
```
    
Sometimes you may prefer to send events to a sub-set of connected users, for example if you have a chat apps with multiple rooms. SocketStream has a cool feature called Private Channels which let you do just that, across multiple servers, with minimum overhead.

The syntax is similar to the command above with an extra initial argument specifying the channel name (or names as an array):

``` coffee-script
SS.publish.channel(['disney', 'kids'], 'newMessage', {from: 'mickymouse', message: 'Has anyone seen Tom?'})
```
    
Users can subscribe to an unlimited number of channels using the following commands (which must be run inside your /app/server code). E.g:

``` coffee-script
  @session.channel.subscribe('disney')        # note: multiple channel names can be passed as an array 
    
  @session.channel.unsubscribe('kids')        # note: multiple channel names can be passed as an array

  @session.channel.unsubscribeAll()           # unsubscribes you from every channel (useful if you've logged out)
    
  @session.channel.list()                     # shows which channels the client is currently subscribed to
```

If the channel name you specify does not exist it will be automatically created. Channel names can be any valid JavaScript object key. If the client gets disconnected and re-connects to another server instance they will automatically be re-subscribed to the same channels, providing they retain the same session ID. Be sure to catch for any errors when using these commands.

**Notes**

The SocketStream Pub/Sub system has been designed from the ground up with horizontal scalability and high-throughput in mind. The 'broadcast' and 'channel' commands will be automatically load-balanced across multiple instances of SocketStream when clustering is made available in the future.

Note, however, that messages are never stored or logged. This means if a client/user is offline the message will be lost rather than queued. Hence, if you're implementing a real time chat app we recommend storing messages in a database (or messaging server) before publishing them.


### HTTP API

The HTTP API allows all server-side actions to be accessed over a traditional HTTP or HTTPS request-based interface.

It is enabled by default and can be configured with the following config variables:

``` coffee-script
SS.config.api.enabled            Boolean       default: true         # Enables/disables the HTTP API
SS.config.api.prefix             String        default: 'api'        # Sets the URL prefix e.g. http://mysite.com/api
```

The HTTP API also supports Basic Auth, allowing you to access methods which use session.user_id. If you wish to use this option, we recommend setting SS.config.api.https_only to true to ensure passwords are never transmitted in clear text.

``` coffee-script    
exports.config = 
  api: 
    auth: 
      basic: 
        module_name: "custom_auth"
```

By placing 'exports.authenticate = true' in the file (see above) the server will know to prompt for a username and password before allowing access any of the actions within that file. However, the API will need to know which module to authenticate against. Set the SS.config.api.auth.basic.module_name variable by putting the following coffee in your config file:

Note: Basic Auth will pass the 'username' and 'password' params to your exports.authenticate function.


### Handling Disconnects

Both websocket and 'flashsocket' tunnels are surprisingly resilient to failure; however, as developers we must always assume the connection will fail from time to time, especially as the client may be on an unstable mobile connection.

**Client Side**

We recommend binding a function to the 'disconnect' and 'connect' events provided by the SocketStream client (courtesy of Socket.IO). For example:

``` coffee-script
SS.socket.on('disconnect', -> alert('Connection Down'))

SS.socket.on('connect', -> alert('Connection Up'))
```

These events can be used client side to toggle an online/offline icon within the app, or better still, to dim the screen and show a 'Attempting to reconnect...' message to users.

You may also want to run custom code on the server when a client connects or disconnects. If so, check out the new Server-side Events feature in 0.2 at /doc/guide/server-side_events.md


### Using custom HTTP handlers / middleware

SocketStream uses Connect both internally, any to allow you to hook into any 3rd-party middleware - or easily write your own!

Middleware can either alter the request object or, more usefully, allow you to respond with your own headers and content depending upon the URL, User Agent and other request parameters sent.

This is a very powerful feature, particularly because it's the first thing Node calls when a HTTP request comes in - so you have all the flexibility and speed of a bare-bones Node.js app.

Please see the comments in /config/http.coffee to make use of custom/3rd-party Connect middleware.


### Configuring Socket.IO

If you wish to configure Socket.IO 0.7 directly you may include an optional configure() function within /app/config.coffee

For example, to make logging more verbose:

``` coffee-script
  socketio:
    configure: (io) ->
      io.set 'log level', 5
```


### Incompatible Browsers

By default SocketStream will attempt to serve real time content to all browsers - either using native websockets (if available) or by falling back to 'flashsockets'.

As flashsockets are not ideal (more overhead, initial connection latency) you may prefer to enable Strict Mode:

``` coffee-script
SS.config.browser_check.strict = true
```
    
Once set, only browsers with native websocket support (currently Chrome 4 and above and Safari 5 and above) will be allowed to connect to your app. All others will be shown /app/views/incompatible.jade (or .html) if present. The name of this view can be customized with SS.config.browser_check.view_name.

In the future we'll improve browser detection by testing for compatible browsers and Flash support in the SocketStream client as a second line of defense.

Note: The serving of HTTP API requests occurs before the browser is checked for compatibility and is hence not affected by these settings.


### Security

So how secure is SocketStream? Well, to be honest - we just don't know. The entire stack, from Node.js right up to the SocketStream client is brand new and no part of it is claiming to be production-ready just yet. So for now we recommend using SocketStream internally, behind a firewall.

Of course, if you're feeling adventurous, you're more than welcome to experiment with hosting public SocketStream websites; like we (will ;) do with www.socketstream.org. Just make sure there is no sensitive data on the server and you can easily restore everything should it become compromised.

If you are especially gifted at spotting vulnerabilities, or come across a potential security hole while looking through the source code, please let us know. We'd really appreciate it. It will bring us closer to the day when we're happy to recommend SocketStream for public websites.


__XSS Attacks__

A quick reminder: SocketStream is just as vulnerable to XSS attacks as other web frameworks. We advise filtering-out any malicious user generated content (UGC) both at input stage (in your /app/server code), as well as in the client before outputting UGC onto the screen. We will include 'helpers' for this in the future.

It is all too easy to append a line of JavaScript code to the end of a user-submitted link which wraps calls to 'SS.server' in a while loop. Which brings us on nicely to...


__Rate Limiting and DDOS Protection__

SocketStream can provide basic protection against DDOS attacks by identifying clients attempting to make over 15 requests per second over the websocket connection (configurable with SS.config.limiter.websockets.rps).

When this occurs you'll be notified of the offending client in the console and all subsequent requests from that client will be silently dropped. This feature is switched off for now whilst we experiment with it in the real world, but can be optionally enabled with SS.config.limiter.enabled = true.


### HTTPS / TLS (SSL)

If you've read the Security section above and decided to deploy a SocketStream app on the edge of the Internet (rather than inside a corporate VPN) HTTPS is not a nice-to-have feature, it's essential.

The reason is two-fold:

1. HTTP proxies, in particular those used by mobile telcos, mangle the headers of each outgoing HTTP request. This often prevent websockets from initializing correctly. HTTPS/TLS not only encrypts your content, but also the HTTP headers - allowing websockets to work as expected, even in Mobile Safari (iPad and iPhone) over a 3G connection.

2. Do you remember [FireSheep](http://en.wikipedia.org/wiki/Firesheep)? Let's stop this problem once and for all by making HTTPS the default when deploying SocketStream apps on the Internet.

The good news is SocketStream makes HTTPS easy. You just need to make sure you've ./configure'ed and compiled Node.js with OpenSSL support. If you don't have the OpenSSL library headers already you can install them on Ubuntu with:

    sudo apt-get install libssl-dev openssl  (Hint: You may need to install/run pkg-config after doing this)

Once Node supports HTTPS/TLS, enable it in SocketStream with SS.config.https.enabled = true in your staging or production environment. By default SocketStream will want to launch the HTTPS server on port 443, so you'll need to run it with 'sudo'.

SocketStream comes with a set of self-signed SSL certificates which are loaded by default if commercial certificates cannot be found. This can be useful for testing/debugging your app; however, you may run into problems with certain browsers which don't support self-signed certificates + websockets together.


**Deploying**

When you're ready to go live you'll need to get a proper commercially-signed SSL certificate. We like the SSL certs from [www.rapidssl.com](www.rapidssl.com) because they support the Mobile version of Safari (iPad and iPhone) which some other popular providers do not.

To obtain a commercial SSL certificate run the following in your project's root directory:

    cd config/ssl_certs

    openssl genrsa -out site.key.pem 2048
    
    openssl req -new -key site.key.pem -out site.request.csr
    
Note: Pay particular attention when entering the Common Name. This should be the full domain (including the www.) of your website.
    
Send the contents of the site.request.csr file to your certificate provider. In exchange you'll receive a certificate which should be installed as /config/ssl_certs/site.cert.pem  You should also receive an 'Intermediate Certificate' which ensures the certificate is recognised by all browsers. Place this in /config/ssl_certs/site.ca.pem

Once all files are present SocketStream will use this certificate instead of the self-signed test certificates and indicate this in the console upon starting the server.


**Redirecting stray requests**

Once HTTPS is enabled it's very important your visitors go to the domain listed as the 'Common Name' in the certificate - typically the 'www.' version of your website. By setting SS.config.https.domain to the FQDN of your website (e.g. www.yourdomain.com), SocketStream will automatically redirect any requests sent to https://yourdomain.com to https://www.yourdomain.com so your visitors never get bugged with nasty security warnings.

What's more, by default, we also launch a secondary HTTP server on Port 80 to re-direct any non-API traffic sent to http:// to https://. Both options can be turned off if desired (inspect SS.config.https to see variables).


**Using multiple certificates**

Finally, you may install multiple SSL certificates in /config/ssl_certs and select the ones you would like SocketStream to use with SS.config.https.cert_name. By default this is set to 'site', hence site.key.pem, site.cert.pem.


### Tests

We have begun to write tests for parts of SocketStream which are unlikely to change in the near future. Currently these live in a separate project any only cover a small number of features - but it's a start. We've chosen Jasmine so far but still need to decide how to organize the files and where to run the specs (as websocket tests are far easier to run in the browser). Once we figure this all out we'll make the tests available on Github.


### Known Issues

* New files added to /lib/client files will not be detected until you restart the server and touch one of the /lib/client files. We will fix this
* Any manipulation of $('body') using jQuery, e.g. $('body').hide(), under Firefox 4 disrupts the flashsocket connection. Until we figure out what's causing this bizarre bug, best avoid calling $('body') in your code.


### FAQs

Q: Will SocketStream support Java/Erlang/PHP/Ruby/Python/my favourite language?

A: Not directly. SocketStream is a stand-alone framework which uses a very carefully curated technology stack. However, rather than re-write your entire app in SocketStream, consider using it as a front-end to a legacy application which you can connect to over a web service or Plug Socket.


Q: Can I integrate SocketStream into my existing web app?

A: No. At least not on the same host and port. For 'hybrid' real time apps we recommend using [Pusher](http://www.pusher.com)


Q: Can I host more than one SocketStream website on the same port?

A: Not at the moment. We will be looking at ways to support this in the future using reverse proxies.


Q: How do I test my app?

A: For now we recommend choosing one of the many testing frameworks available for Node.js. Let us know if there is anything we can do to help integrate SocketStream with your framework of choice. SocketStream will have an in-built default testing framework in the future but it will be a radical departure from anything that's gone before. Look out for announcements towards the end of 2011.


Q: Can I deploy SocketStream apps to Heroku?

A: Not at the moment as Heroku cannot correctly route websockets. We are sure other Node.js hosting services will launch in the future with SocketStream/websocket-based apps in mind. We'll mention them here when they do.


Q: How do I make models?

A: There is no ability to create server-side models at the moment. This won't stop you from making many types of apps such as real-time chat, but may prove annoying if your app involves lots of CRUD. The good news is we have a great solution called Real Time Models which will be available in version 0.3.


Q: Does SocketStream work with Backbone.js

A: Not yet, but it's coming in version 0.3. There are already community efforts underway to make it work right now. Please take a look at our Google Group for the latest developments.


Q: Will the API / directory structure / config file format change in the future?

A: Yes. SocketStream is not just a new web framework, it's at the forefront of an entirely new way to develop web applications, so expect a lot of rapid change over the next 12 months as we explore new ideas. Things should settle down a little after 1.0.0 is released. Until then we will do everything we can to keep developers involved and up-to-date with any major changes. We will also provide automatic upgrade scripts where possible. The best thing to do is keep checking the HISTORY file and be sure to quote the SocketStream version number next to any examples you post online.


Q: Will SocketStream have a public website?

A: Sure! We're working on www.socketstream.org right now :)


Q: Will websockets work in Opera?

A: As of this writing websockets is supported but turned off by default in Opera. In order for Opera 11 to run websockets apps you need to turn it on in the settings. Do "opera:config#Enable%20WebSockets" in the address field and hit enter. Check "Enable websockets" Save and you are good to go.


### Core Team

* Owen Barnes (socketstream & owenb)
* Paul Jensen (paulbjensen)
* Alan Milford (alz)
* Addy Osmani (addyosmani)


### Contributing

We welcome contributions from forward-thinking hackers keen to redefine what's possible on the web. Big, bold ideas, unconstrained by frameworks and concepts from the past will always be welcome.

The best developers take 10 lines of code and come up with a completely new design that needs 3. If you're one of these rare breed of people we'd love to have you onboard as a potential member of our core team. Test writers and creators of beautiful documentation will receive our maximum appreciation and support as they seek to keep up with a rapidly moving target.

Before you add a major new feature to SocketStream and submit a pull request, bear in mind our goal is to ensure the core stays lean, robust, and breathtakingly fast. Additional non-core functionality should be provided by NPM modules. We'll make this possible/easier as time goes on.

Tip: When developing on the SocketStream JS client (/lib/frontend/client/socketstream.coffee) be sure to have the server running at the same time as this will re-compile/minify everything for you.

If you wish to discuss an idea, or want to chat about anything else, email us at info@socketstream.org


### Credits

Thanks to Guillermo Rauch (Socket.IO), TJ Holowaychuk (Stylus, Jade), Jeremy Ashkenas (CoffeeScript), Mihai Bazon (UglifyJS), Isaac Schlueter (NPM), Salvatore Sanfilippo (Redis) and the many others who's amazing work has made SocketStream possible. Special thanks to Ryan Dahl (creator of node.js) for the inspiration to do things differently.


### Thanks!

SocketStream is kindly sponsored by AOL.


### License

SocketStream is released under the MIT license.
