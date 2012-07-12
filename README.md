![SocketStream!](https://github.com/socketstream/socketstream/raw/master/new_project/client/static/images/logo.png)

# SocketStream

Latest release: 0.3.0 RC2  ([view changelog](https://github.com/socketstream/socketstream/blob/master/HISTORY.md))

[![build status](https://secure.travis-ci.org/socketstream/socketstream.png)](http://travis-ci.org/socketstream/socketstream)

Twitter: [@socketstream](http://twitter.com/#!/socketstream)  
Google Group: http://groups.google.com/group/socketstream  
IRC channel: [#socketstream](http://webchat.freenode.net/?channels=socketstream) on freenode

Take a tour of all the new features at http://www.socketstream.org/tour and watch the [introductory video](http://vimeo.com/43027679) (recorded May 2012).


### Introduction

SocketStream is an open source Node.js web framework dedicated to building **single-page realtime apps**.

Whether you're building a group chat app, multiplayer game, trading platform, sales dashboard, or any other realtime web app, SocketStream gets you up and running quickly by providing essential functionality and a rapid development environment.

Rather than attempting to do everything, SocketStream is just a regular Node.js module designed to work well alongside other great NPM modules such as Express.js, MongoDb, Redis, Everyauth and many more. On the client-side, you're free to use all the technologies you already know and love - such as jQuery, Mustache, Backbone.js, Ember.js, Angular.js, or just plain vanilla JS.

Whilst we have chosen not to support models or reactive templating in the core, we offer a [powerful API](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/writing_request_responders.md) that allows developers to build optional modules to experiment with different approaches. The best third-party modules will be featured on our website in the near future.

SocketStream apps can easily be deployed to [Nodejitsu](http://nodejitsu.com), [EC2 servers](http://aws.amazon.com/ec2) or any other hosting platform supporting websockets (sadly that excludes [Heroku](http://www.heroku.com) for the moment).

While it is still early days, our end goal is to ensure SocketStream can be used to power large-scale 'serious' web apps where scalability, flexibility and high availability are key.


#### Quick Facts

* A lean, lightweight core, optionally extended using standard NPM modules
* Excellent code organization, modularity and extensibility
* Prioritizes integration with third-party NPM modules
* Write all client & server code in JavaScript (or [CoffeeScript](http://jashkenas.github.com/coffee-script) if you prefer)
* MIT Licensed. Use SocketStream commercially without restriction


### Status

SocketStream is in full-time development, rapidly progressing thanks to frequent contributions from a [growing community](http://groups.google.com/group/socketstream) of developers.

SocketStream 0.3.0 will be pushed to npm in the next few days. The features and API are now frozen.


## Features

#### Client Side

* Works great with Chrome, Safari, Firefox 6 (and above) using native websockets
* Compatible with older versions of Firefox and IE thanks to configurable fallback transports
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


#### Server Side

* True bi-directional communication using websockets (or websocket fallbacks). No more slow, messy AJAX!
* Modular Websocket Transports - switch between [Socket.IO](http://socket.io) (bundled by default) or [SockJS](https://github.com/socketstream/ss-sockjs) without changing your app code
* Easily share code between the client and server. Ideal for business logic and model validation (see Questions below)
* Request Middleware - enabling session access, authentication, logging, distributed requests and more
* Effortless, scalable, pub/sub baked right in - including Private Channels
* Easy authentication - use a backend database or authenticate against Facebook Connect, Twitter, etc using [Everyauth](https://github.com/bnoguchi/everyauth)
* Uses [Connect 2.0](http://senchalabs.github.com/connect/) - Hook-in your own HTTP middleware, share sessions between HTTP/Connect/Express/SocketStream
* Optionally use [Redis](http://www.redis.io) for fast session retrieval, pub/sub, list of users online, and any other data your app needs instantly


#### Optional Modules (officially maintained and supported)

* **[ss-sockjs](https://github.com/socketstream/ss-sockjs)** Use [SockJS](https://github.com/sockjs/sockjs-client) as the websocket transport instead of Socket.IO
* **[ss-console](https://github.com/socketstream/ss-console)** Connect to a live server and call RPC actions or publish events over the REPL / terminal
* Code Formatters: **[ss-coffee](https://github.com/socketstream/ss-coffee)** (CoffeeScript), **[ss-jade](https://github.com/socketstream/ss-jade)** Jade (for HTML), **[ss-stylus](https://github.com/socketstream/ss-stylus)** Stylus (for CSS), **[ss-less](https://github.com/socketstream/ss-less)** Less (for CSS)
* Client-side Template Engines: **[ss-hogan](https://github.com/socketstream/ss-hogan)** Hogan/Mustache, **[ss-coffeekup](https://github.com/socketstream/ss-coffeekup)** CoffeeKup

***

### How does it work?

SocketStream automatically compresses and minifies the static HTML, CSS and client-side code your app needs and sends this through the first time a user visits your site.

From then on all application data is sent and received via the websocket (or websocket fallbacks), instantly established when the client connects and automatically re-established if broken. Normally this will be in [JSON RPC](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/rpc_responder.md) format, but SocketStream 0.3 allows you to use different Request Responders depending upon the task at hand.

All this means no more connection latency, HTTP header overhead, polling, or clunky AJAX. Just true bi-directional, asynchronous, 'streaming' communication between client and server.


### Getting Started

Ready to give it a whirl? Install [Node 0.8.X](http://nodejs.org/#download) and checkout the latest code from master:

    [sudo] npm install git://github.com/socketstream/socketstream.git

To generate a new empty SocketStream project type:

    socketstream new <name_of_your_project>

__Tip: Type `socketstream -h` to view all available options__

Install the bundled (optional) dependencies:

    cd <name_of_your_project>
    [sudo] npm link socketstream
    [sudo] npm install

To start your app simply type:

    node app.js
    
If all goes well you'll see the SocketStream banner coming up, then you're ready to visit your new app at:

    http://localhost:3000


### What can I create with it?

SocketStream is a perfect fit for all manner of modern applications which require realtime data (chat, stock trading, location monitoring, analytics, etc). It's also a great platform for building realtime HTML5 games. 

However, right now it would make a poor choice for a blog or other content-rich site which requires unique URLs for search engine optimization.


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

Restart the server and then invoke this function from the browser's command line:

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

Documentation is constantly expanding and currently available in [English](https://github.com/socketstream/socketstream/tree/master/doc/guide/en) and [Korean](https://github.com/socketstream/socketstream/tree/master/doc/guide/ko).

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
* [Testing Your App](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/server_side_testing.md)

##### Extending SocketStream

* [Writing Template Engine Wrappers](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/template_engine_wrappers.md) - support any of the gazillion template formats out there
* [Writing Request Responders](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/writing_request_responders.md) - experiment with models and low-level message protocols

##### Other

* [Changes since 0.2](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/changes_since_0.2.md)

***


### Questions?

##### How can I make my app auto-restart when /server code changes?

Install the excellent 'nodemon' module with `sudo npm install -g nodemon` then start your app with `nodemon app.js`. A `.nodemonignore` file has already been created for you with the optimal settings. This feature is very useful when developing your app.


##### How can I configure Socket.IO?

You may fully configure the Socket.IO server and client libraries like so:

```javascript
ss.ws.transport.use('socketio', {
  client: {
    transports: ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']
  },
  server: function(io){
    io.set('log level', 4)
  }
});
```


##### Where can I deploy my apps to?

SocketStream works great with [Nodejitsu.com](http://www.nodejitsu.com), as well as custom EC2 / cloud servers. Sadly [Heroku.com](http://www.heroku.com) does not currently support websockets.

Tip: If you're deploying to Nodejitsu add the following dependency to your `package.json`:

    "socketstream": "git://github.com/socketstream/socketstream.git#master"


##### Will it run on Windows?

Yes. We have several users running SocketStream on Windows without problems. Please see the Windows installation instructions in INSTALL.md


##### How can I share code between client and server?

Simply `require()` one of your client-side modules in your server-side code.


##### Does SocketStream support models?

Rather than cluttering-up the core with opinionated choices around models, persistent storage engines, security, reactive templates and more, we offer a [powerful API](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/writing_request_responders.md) to allow developers to experiment with different approaches to model synching, client-side APIs (e.g. simulating MongoDB in the browser), and much more.

The best third-party Request Responders will be featured on our website in the near future, giving you the ability to pick the best tools for your particular use-case.


##### Should I use Redis?

Yes. SocketStream installs the Redis driver by default but does not require Redis to be running when developing your app (for convenience sake). However, as soon as you want to host your app for real, you need to be using Redis.

Redis is used in two areas of SocketStream - session storage and internal pubsub (used by `ss.publish` commands). You can enable Redis in your app with the following commands in your app.js file:

    ss.session.store.use('redis');
    ss.publish.transport.use('redis');

Pass any config as the second argument to either of the above commands as so:

    {host: 'localhost', port: 6379, pass: 'myOptionalPass', db: 3}


##### How about scaling?

SocketStream 0.3 makes a big assumption in order to maximize speed and reduce code complexity: All incoming connections with the same session should be routed to the same server (also known as Sticky Sessions). The session details are stored in memory and then optionally saved to Redis to preserve the session should the node fail.

Front end scaling can be achieved using a combination of different websocket transports (such as the forthcoming Pusher Pipe module) and optional features we intend to introduce in the future.

Back end scaling has yet to be properly documented, but we're keen to continue looking into ways to use ZeroMQ and also Hook IO. We will make sure back end scaling is as easy and flexible as possible, but it will no longer be a feature of the framework itself.


### Videos


* November 2011 - [Presentation to KrtConf.com](http://2011.krtconf.com/videos/owen_barnes), Portland
* May 2012 - [Presentation to LNUG.org](http://vimeo.com/43027679), London (most recent)


### Developing on the SocketStream core

SocketStream is primarily written in CoffeeScript which is 'pre-compiled' into JavaScript using `make build`. If you're actively developing on the code make sure you install the dev dependencies first (just clone the project and type `sudo npm link`).

To avoid having to continually type `make build` every time you make a change, pass the `SS_DEV=1` environment variable when running your SocketStream app:

    $ SS_DEV=1 node app.js

This instructs your app to run the CoffeeScript code in `<socketstream_root>/src` directly, so you only need to restart the server to see your changes.


### Recommended alternatives to SocketStream

We hope you'll find SocketStream is a great fit for your app, but if it's not exactly what you're looking for, consider these alternatives:

If SEO is important to you, take a look at [Derby](http://www.derbyjs.com). If you're looking for an end-to-end commercial solution, [Meteor](http://www.meteor.com) is the best out there.


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

