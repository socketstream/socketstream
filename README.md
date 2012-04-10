![SocketStream!](https://github.com/socketstream/socketstream/raw/master/new_project/client/static/images/logo.png)

# SocketStream

Latest release: 0.3.0beta2  ([view changelog](https://github.com/socketstream/socketstream/blob/master/HISTORY.md))
[![build status](https://secure.travis-ci.org/socketstream/socketstream.png)](http://travis-ci.org/socketstream/socketstream)

Twitter: [@socketstream](http://twitter.com/#!/socketstream)  
Google Group: http://groups.google.com/group/socketstream  
IRC channel: [#socketstream](http://webchat.freenode.net/?channels=socketstream) on freenode

Take a tour of all the new features at http://www.socketstream.org/tour



### Introduction

SocketStream is a new open source Node.js web framework dedicated to building **single-page realtime apps**.

Whether you're building a group chat app, multiplayer game or trading platform, SocketStream makes realtime web development fun and easy. It provides the structure and back-end functionality your app needs, whilst allowing you to build the front-end using technologies you already know (such as jQuery, Hogan, Backbone.js, Ember.js).

We follow a few guiding principals to keep the framework lean, modular and extensible whilst ensuring your app can easily integrate with other great Node.js modules such as [Express.js](http://expressjs.com), [Everyauth](https://github.com/bnoguchi/everyauth) and [thousands](http://search.npmjs.org) more.

SocketStream 0.3 is in full-time development, rapidly progressing thanks to frequent contributions from a [growing community](http://groups.google.com/group/socketstream) of developers. Now the 0.3 API is pretty much stable there will be frequent updates to master before 0.3.0 is pushed to NPM later in April. Demos and more documentation coming soon.



### Main Features

#### General

* Designed for large apps - excellent code organization, modularity and extensibility. Not a black box framework
* True bi-directional communication using websockets (or [Socket.IO 0.9](http://socket.io) fallbacks). No more slow, messy AJAX!
* Write all code in JavaScript or [CoffeeScript](http://jashkenas.github.com/coffee-script/) - your choice
* Works well alongside [Express.js](http://expressjs.com) and other Connect-based frameworks
* Easily share code between the client and server. Ideal for business logic and model validation (see Questions below)
* Request Middleware - enabling session access, authentication, logging, distributed requests and more
* Effortless, scalable, pub/sub baked right in - including Private Channels
* Easy authentication - use a backend database or authenticate against Facebook Connect, Twitter, etc using [Everyauth](https://github.com/bnoguchi/everyauth)
* Uses [Connect 2.0](http://senchalabs.github.com/connect/) - Hook-in your own HTTP middleware, share sessions between HTTP/Connect/Express/SocketStream
* Optionally use [Redis](http://www.redis.io) for fast session retrieval, pub/sub, list of users online, and any other data your app needs instantly
* Modular transport design allow alternative websocket or back-end event transports to be used
* MIT License

#### Client Side

* Works great with Chrome, Safari, Firefox 6 (and above) using native websockets
* Compatible with older versions of Firefox and IE thanks to configurable fallback transports provided by Socket.IO
* Use `require()` and `exports` in your client-side code as you would on the server
* Define multiple single-page clients by choosing the CSS, JS and client-side templates you wish to serve
* Integrated asset manager - automatically packages and [minifies](https://github.com/mishoo/UglifyJS) all client-side assets
* Live Reload - automatically reloads the browser when a HTML, CSS or JS client file changes
* Works with iPads and iPhones using Mobile Safari (iOS 4.2 and above), even over 3G. Send a smaller, lighter client if desired
* Use optional code formatters (e.g. CoffeeScript, Jade, Stylus, Less, etc) by easily installing wrapper modules
* Multiple clients work seamlessly with HTML Push State 'mock routing' so you can use [Backbone Router](http://documentcloud.github.com/backbone/#Router), [Davis JS](http://davisjs.com) and more
* Supports many client-side template languages (Hogan/Mustache/CoffeeKup/jQuery), pre-compiling them for speed
* Works great with [Ember.js](http://emberjs.com) for 'reactive templates' which automatically update when data changes
* Bundled with jQuery - though not dependent on it. Will work great with Zepto and other libraries
* Easily add additional client libraries such as [Underscore.js](http://documentcloud.github.com/underscore/)

#### Optional Modules (officially maintained and supported)

* **[ss-console](https://github.com/socketstream/ss-console)** Connect to a live server and call RPC actions or publish events over the REPL / terminal
* Code Formatters: **[ss-coffee](https://github.com/socketstream/ss-coffee)** (CoffeeScript), **[ss-jade](https://github.com/socketstream/ss-jade)** Jade (for HTML), **[ss-stylus](https://github.com/socketstream/ss-stylus)** Stylus (for CSS), **[ss-less](https://github.com/socketstream/ss-less)** Less (for CSS)
* Client-side Template Engines: **[ss-hogan](https://github.com/socketstream/ss-hogan)** Hogan/Mustache, **[ss-coffeekup](https://github.com/socketstream/ss-coffeekup)** CoffeeKup



### How does it work?

SocketStream automatically compresses and minifies the static HTML, CSS and client-side code your app needs and sends this through the first time a user visits your site.

From then on all application data is sent and received via the websocket (or Socket.IO fallbacks), instantly established when the client connects and automatically re-established if broken. Normally this will be in [JSON RPC](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/rpc_responder.md) format, but SocketStream 0.3 allows you to use different message responders depending upon the task at hand.

All this means no more connection latency, HTTP header overhead, polling, or clunky AJAX. Just true bi-directional, asynchronous, 'streaming' communication between client and server.



### Getting Started

Ready to give it a whirl? Install [Node 0.6.X](http://nodejs.org/#download) then clone the project locally (just until 0.3.0 is released and published to `npm`):

    git clone https://github.com/socketstream/socketstream.git
    cd socketstream
    sudo npm link

To generate a new empty SocketStream project type:

    socketstream new <name_of_your_project>

Install the bundled (optional) dependencies:

    cd <name_of_your_project>
    npm install
    npm link socketstream

To start your app simply type:

    node app.js
    
If all goes well you'll see the SocketStream banner coming up, then you're ready to visit your new app at:

    http://localhost:3000


### What can I create with it?

SocketStream is a perfect fit for all manner of modern applications which require realtime data (chat, stock trading, location monitoring, analytics, etc). It's also a great platform for building realtime HTML5 games. However, right now it would make a poor choice for a blog or other content-rich site which requires unique URLs for search engine optimization.


### Demo Apps

SocketStream 0.3 example apps coming soon!


### Example 1: Basic RPC

SocketStream 0.3 supports multiple ways to send messages to and from the server. The most common of which, JSON-over-RPC, is included by default. An RPC call can be invoked on the server by calling `ss.rpc()` in the browser.

For example, let's write a simple server-side function which squares a number:

``` javascript
// server/rpc/app.js
exports.actions = function(req, res, ss){

  // return list of actions which can be called publicly
  return {

    square: function(number){
      res(number * number);
    }

  }
}
```

Restart the server and then invoke this function from the brower's command line:

``` javascript
ss.rpc('app.square', 25)
```

You'll see the answer `625` logged to the console by default. The eagle-eyed among you will notice `ss.rpc('app.square', 25)` actually returned `undefined`. That's fine. We're only interested in the asynchronous response sent from the server once it has processed your request.

You may be wondering why `app.square`? Because we're invoking the `square` action/function in the `app.js` file. If you had written a `resize` action in `/server/rpc/image/processor.js` you'd call it with `ss.rpc('image.processor.resize')`. Create as many sub-directories as you wish to organize your code.

Now let's write some code in the client to do more with this response:

``` javascript
// client/code/app/demo.js

// define the number to square (vars are local to this file by default)
var number = 25;

ss.rpc('app.square', number, function(response){
  alert(number + ' squared is ' + response);
});
```

Once you save the file, the browser will automatically reload and you'll see an alert box popup with the following:

    25 squared is 625
    
More examples coming soon!


### Documentation

Please start with http://www.socketstream.org/tour which walks you through the key features and shows you the code.

We've made a start on documentation for 0.3. Right now the following sections have been written in `/doc/guide/en`:

##### Developing (Client-side)

* [Client-side Code](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/client_side_code.md)
* [Client-side Templates](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/client_side_templates.md)
* [Defining multiple Single-Page Clients](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/defining_multiple_clients.md)
* [Loading Assets On Demand](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/loading_assets_on_demand.md)
* [Live Reload](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/live_reload.md)
* [Web Workers](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/web_workers.md)

##### Developing (Server-side)

* [RPC Responder](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/rpc_responder.md)
* [Pub/Sub Events](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/pub_sub_events.md)
* [Sessions](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/sessions.md)
* [Request Middleware](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/request_middleware.md)
* [HTTP Middleware](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/http_middleware.md)
* [Authentication](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/authentication.md)

##### Extending SocketStream

* [Writing Template Engine Wrappers](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/template_engine_wrappers.md)

##### Other

* [Changes since 0.2](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/changes_since_0.2.md)

***

### Questions?

##### How can I make my app auto-restart when /server code changes?

Install the excellent 'nodemon' module with `sudo npm install -g nodemon` then start your app with `nodemon app.js`. A `.nodemonignore` file has already been created for you with the optimal settings. This feature is very useful when developing your app.


##### How can I configure Socket.IO?

Like so:

```javascript
ss.ws.transport.use('socketio', {io: function(io){
  io.set('log level', 4)
}});
```

##### Will it run on Windows?

Yes. We have several users running SocketStream on Windows without problems. Please see the Windows installation instructions in INSTALL.md


##### How can I share code between client and server?

Simply `require()` one of your client-side modules in your server-side code.


##### Does SocketStream support models?

Not yet. Right now we only support RPC calls and Events. However, websocket middleware and modular websocket responders were introduced in 0.3 to encourage people to start experimenting with different ways to define, access and sync models over websockets. If and when good contributed solutions exist we will promote them here. Models will be our primary focus for the next major release.


##### Should I use Redis?

Yes. SocketStream installs the Redis driver by default but does not require Redis to be running when developing your app (for convenience sake). However, as soon as you want to host your app for real, you need to be using Redis.

Redis is used in two areas of SocketStream - session storage and internal pubsub (used by ss.publish commands). You can enable Redis in your app with the following commands in your app.js file:

    ss.session.store.use('redis');
    ss.publish.transport.use('redis');

Pass any config as the second argument to either of the above commands as so:

    {host: 'localhost', port: 6379, pass: 'myOptionalPass', db: 3}


##### How about scaling?

SocketStream 0.3 makes a big assumption in order to maximize speed and reduce code complexity: All incoming connections with the same session should be routed to the same server (also known as Sticky Sessions). The session details are stored in memory and then optionally saved to Redis to preserve the session should the node fail.

Front end scaling can be achieved using a combination of different websocket transports (such as the forthcoming Pusher Pipe module) and optional features we intend to introduce in the future.

Back end scaling has yet to be properly documented, but we're keen to continue looking into ways to use ZeroMQ and also Hook IO. We will make sure back end scaling is as easy and flexible as possible, but it will no longer be a feature of the framework itself.


### Developing on the SocketStream core

SocketStream is primarily written in CoffeeScript which is 'pre-compiled' into JavaScript using `make build`. If you're actively developing on the code make sure you install the dev dependencies first (just clone the project and type `sudo npm link`).

To avoid having to continually type `make build` every time you make a change, pass the `SS_DEV=1` environment variable when running your SocketStream app:

    $ SS_DEV=1 node app.js

This instructs your app to run the CoffeeScript code in `<socketstream_root>/src` directly, so you only need to restart the server to see your changes.


### Testing

There are a number of [Mocha](http://visionmedia.github.com/mocha/) tests starting to appear for parts of the API which are unlikely to change. To run them type:

    $ make test
    
More tests coming soon. Contributions very much appreciated.


### Contributors

Creator and lead developer: Owen Barnes.

Special thanks to Paul Jensen for contributing code, ideas and testing early prototypes. Big thanks also to Addy Osmani for help with everything JavaScript related, Alan Milford for the excellent SocketRacer.com demo (which will be running on SocketStream 0.3 soon!), and Craig Jordan Muir for designing the awesome new SocketStream logo.

Thanks also to the many who have contributed code and ideas. We plan to properly feature contributors on our website in the near future.


### Credits

Thanks to Guillermo Rauch (Socket.IO), TJ Holowaychuk (Stylus, Jade), Jeremy Ashkenas (CoffeeScript), Mihai Bazon (UglifyJS), Isaac Schlueter (NPM), Salvatore Sanfilippo (Redis) and the many others who's amazing work has made SocketStream possible. Special thanks to Ryan Dahl (creator of node.js) for the inspiration to do things differently.


### Thanks!

SocketStream is kindly sponsored by AOL.


### License

SocketStream is released under the MIT license.

