![SocketStream!](https://github.com/socketstream/socketstream/raw/master/new_project/client/static/images/logo.png)

# SocketStream [![Build Status](https://api.travis-ci.org/socketstream/socketstream.png?branch=master)](https://travis-ci.org/socketstream/socketstream) [![Dependency Status](https://david-dm.org/socketstream/socketstream.png)](https://david-dm.org/socketstream/socketstream#info=dependencies) [![devDependency Status](https://david-dm.org/socketstream/socketstream/dev-status.png)](https://david-dm.org/socketstream/socketstream#info=devDependencies)



_Latest release: 0.3.10 ([view changelog](https://github.com/socketstream/socketstream/blob/master/HISTORY.md))_

A fast, modular Node.js web framework dedicated to building single-page realtime apps

[Live demo](http://demo.socketstream.org)

### Introduction

SocketStream is a new breed of web framework that uses websockets to push data to the browser in 'realtime'. It makes it easy to create blazing-fast, rich interfaces which behave more like desktop apps than traditional web apps of the past.

By taking care of the basics, SocketStream frees you up to focus on building your social/chat app, multiplayer game, trading platform, sales dashboard, or any kind of web app that needs to display realtime streaming data. All personal tastes (e.g. Vanilla JS vs CoffeeScript, Stylus vs Less) are catered for with optional npm modules that integrate perfectly in seconds, without bloating the core.

Learn more by [taking a tour](http://www.socketstream.org/tour) of the features, or watching [a recent talk](http://www.youtube.com/watch?v=LOS1lpWXphs) (recorded September 2012). 


### Why SocketStream?

Building a simple chat app that uses websockets is easy.
Building a rich, non-trivial, responsive realtime UI without ending up with a mess of code is hard.

SocketStream eases the pain by:

* Integrating best-of-breed modules to increase productivity
* Providing a sensible place to put everything
* Accelerating development with Live Reload and (optional) support for Stylus, Jade, etc
* Accelerating deployment with integrated asset packing and CDN support
* Organizing spaghetti client-side code into modules you can `require()`
* Working well with all major client-side frameworks (e.g. Backbone, Ember, Angular)
* Making it easy to hookup Redis, MongoDB, CouchDB or other storage engines
* Providing an active community to answer your question 

No other realtime framework plays as well with the entire Node.js ecosystem, or gives you the flexibility to swap-out code pre-processors, template engines or even websocket transports until you have the very best custom stack for your app.

SocketStream is MIT licensed.


### Status

SocketStream 0.3 is now stable enough for production use internally (behind a firewall). Several pioneering users are successfully hosting external apps in production, though we ask you to use caution and appreciate that SocketStream is new software which has yet to be battle hardened. SocketStream 0.3 will continue to be updated with bug fixes and minor feature enhancements.

All major development work is going on in [SocketStream 0.4](https://github.com/socketstream/socketstream-0.4) which builds upon the features and ideas in 0.3. Thanks to a new modular approach, SocketStream 0.4 will provide the initial ease of an integrated web framework with the flexibility of small modules that do one thing well. [Read more](https://gist.github.com/socketstream/5461356).


### Contact

Twitter: [@socketstream](http://twitter.com/#!/socketstream)  
Google Group: http://groups.google.com/group/socketstream  
IRC channel: [#socketstream](http://webchat.freenode.net/?channels=socketstream) on freenode


## Features

#### Client Side
 
* Use `require()` and `exports` in your client-side code as you would on the server
* Define multiple single-page clients by choosing the CSS, JS and client-side templates you wish to serve
* Integrated asset manager - packages and [minifies](https://github.com/mishoo/UglifyJS) all client-side assets. Includes CDN support
* Live Reload - automatically reloads the browser when a HTML, CSS or JS client file changes
* Comprehensive support for client-side templates - use Hogan/Mustache/CoffeeKup/jQuery or write your own wrapper
* Use optional code formatters (e.g. CoffeeScript, Jade, Stylus, Less, etc) by easily installing wrapper modules
* Multiple clients work seamlessly with HTML Push State 'mock routing' so you can use [Backbone Router](http://documentcloud.github.com/backbone/#Router), [Davis JS](http://davisjs.com) and more
* Works great with [Ember.js](http://emberjs.com) for 'reactive templates' which automatically update when data changes
* Bundled with jQuery - though not dependent on it. Will work great with Zepto and other libraries
* Easily use additional client libraries such as [Underscore.js](http://documentcloud.github.com/underscore/)
 
 
#### Server Side
 
* True bi-directional communication using websockets (or websocket fallbacks). No more slow, messy AJAX!
* Modular Websocket Transports - switch between [Socket.IO](http://socket.io) (bundled by default) or [SockJS](https://github.com/socketstream/ss-sockjs) without changing your app code
* Easily share code between the client and server. Ideal for business logic and model validation (see FAQs below)
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

SocketStream sends all the static HTML, CSS and client-side code your app needs the first time a user visits your site (all automatically compressed in `production` mode).

From then on all application data is sent and received via the websocket (or websocket fallbacks), instantly established when the client connects and automatically re-established if broken. Normally this will be in [JSON RPC](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/rpc_responder.md) format, but SocketStream 0.3 allows you to use different Request Responders (message handlers) depending upon the task at hand.

All this means no more connection latency, HTTP header overhead, polling, or clunky AJAX. Just true bi-directional, asynchronous, 'streaming' communication between client and server.



### Getting Started

Ready to give it a whirl? Install [Node 0.10.X](http://nodejs.org/#download) then get SocketStream from npm:

    [sudo] npm install -g socketstream

To generate a new empty SocketStream project type:

    socketstream new <name_of_your_project>

__Tip: Type `socketstream -h` to view all available options__

Install the bundled (optional) dependencies:

    cd <name_of_your_project>
    [sudo] npm install

To start your app simply type:

    node app.js
    
If all goes well you'll see the SocketStream banner coming up, then you're ready to visit your new app at:

    http://localhost:3000


### What can I create with it?

SocketStream is a perfect fit for all manner of modern applications which require realtime data (chat, stock trading, location monitoring, analytics, etc). It's also a great platform for building realtime HTML5 games. 

However, it would make a poor choice for a blog or other content-rich site which requires unique URLs for search engine optimization.


### Demo Apps

0.3 apps in production: [Dashku.com](https://dashku.com)

More code examples to follow.


### Example 1: Basic RPC

SocketStream 0.3 supports multiple ways to send messages to and from the server. The most common of which, JSON-over-RPC, is included by default. An RPC call can be invoked on the server by calling `ss.rpc()` in the browser.

For example, let's write a simple server-side function which squares a number:

``` javascript
// in /server/rpc/app.js
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

You may be wondering why `app.square`? Because we're invoking the `square` action/function in the `app.js` file. If you had written a `resize` action in `/server/rpc/image/processor.js` you'd call it with `ss.rpc('image.processor.resize')`. This naming convention allows you to create as many sub-directories as you wish to organize your code.

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

##### Best Practices

* [Hosting in Production](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/production_hosting.md) - Packing assets, CDNs, handling exceptions

##### Extending SocketStream

* [Writing Template Engine Wrappers](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/template_engine_wrappers.md) - support any of the gazillion template formats out there
* [Writing Request Responders](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/writing_request_responders.md) - experiment with models and low-level message protocols

##### Other

* [Changes since 0.2](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/changes_since_0.2.md)

***


### FAQs?


##### What browsers will SocketStream work with?

SocketStream works best with Chrome, Safari, Firefox 6 (and above) which all support native websockets. It is also compatible with older versions of Firefox and IE thanks to Socket.IO fallback transports. In addition, iPads and iPhones using Mobile Safari (iOS 4.2 and above) are fully supported, even over 3G.


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


##### Will it run on Windows?

Yes. We have many users running SocketStream on Windows without problems. Make sure that you have [Make for Windows](http://gnuwin32.sourceforge.net/packages/make.htm) installed beforehand.

##### How can I share code between client and server?

Simply `require()` one of your client-side modules in your server-side code.


##### Does SocketStream support models?

No. Not in the core.

Instead we offer a [powerful API](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/writing_request_responders.md) to allow developers to experiment with opinionated approaches to model synching, client-side APIs (e.g. simulating MongoDB in the browser), serialization protocols, and much more.

Several third-party add-on modules (for Backbone, Angular and more) are now in active development by the community. Please search our [Google Group](http://groups.google.com/group/socketstream) for details.

Ideally we'd like to end up with one great, well-maintained module for each major client-side framework which allows for seamless high-speed model syncing to your choice of persistent store. The best modules will be featured on our website in the near future, giving you the ability to pick the best tools for your particular use-case.


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

(most recent at end)

* [KrtConf.com, Portland, November 2011](http://2011.krtconf.com/videos/owen_barnes)
* [LNUG.org, London, May 2012](http://vimeo.com/43027679)
* [LXJS, Lisbon, September 2012](http://www.youtube.com/watch?v=LOS1lpWXphs)
* [RealtimeConf, Portland, October 2012](http://2012.realtimeconf.com/video/owen-barnes)
* [QCon, San Francisco, November 2012](http://www.infoq.com/presentations/SocketStream)


### Developing on the SocketStream core

SocketStream (up to 0.3.5) was primarily written in CoffeeScript, and was 'pre-compiled' into JavaScript using `make build`. From 0.3.6, SocketStream is now written in Javascript.

We are moving towards linting all of the code in the lib directory with JSHint. There is a Grunt task to help with this process. First, install the grunt-cli module (based on instructions here: http://gruntjs.com/getting-started), and then you can run the following commands:

    grunt jshint:server
    grunt jshint:client

### Recommended alternatives to SocketStream

We hope you'll find SocketStream is a great fit for your app, but if it's not exactly what you're looking for, consider these alternatives:

If SEO is important to you, take a look at [Derby](http://www.derbyjs.com). If you're looking for an end-to-end commercial solution, [Meteor](http://www.meteor.com) is the best out there.


### Testing

There are a number of [Mocha](http://visionmedia.github.com/mocha/) tests starting to appear for parts of the API which are unlikely to change. To run them type:

    $ make test
    
More tests coming soon. Contributions very much appreciated.


### Contributors

Creator and lead developer: Owen Barnes.

Special thanks to Paul Jensen for contributing code, ideas and testing early prototypes. Big thanks also to Addy Osmani for help with everything JavaScript related, Alan Milford for providing initial demos, and Craig Jordan Muir for designing the awesome new SocketStream logo.

Thanks also to the many who have contributed code and ideas. We plan to properly feature contributors on our website in the near future.


### Credits

Thanks to Guillermo Rauch (Socket.IO), TJ Holowaychuk (Stylus, Jade), Substack (Browserify), Jeremy Ashkenas (CoffeeScript), Mihai Bazon (UglifyJS), Isaac Schlueter (NPM), Salvatore Sanfilippo (Redis) and the many others who's amazing work has made SocketStream possible. Special thanks to Ryan Dahl (creator of node.js) for the inspiration to do things differently.


### License

SocketStream is released under the MIT license.
