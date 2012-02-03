![SocketStream!](https://github.com/socketstream/socketstream/raw/master/new_project/client/static/images/logo.png)

# SocketStream

Latest release: 0.3.0alpha2

Twitter: [@socketstream](http://twitter.com/#!/socketstream)  
Google Group: http://groups.google.com/group/socketstream  
IRC channel: [#socketstream](http://webchat.freenode.net/?channels=socketstream) on freenode

Welcome to SocketStream 0.3 - a complete re-write of previous versions with the main aim of making the project easier to contribute to and extend with third party modules.

Take a tour of all the new features at http://www.socketstream.org/tour


### Status

This is a working alpha release of SocketStream 0.3 intended for experimentation and use by early adopters who don't mind a rapidly changing API. There is still [plenty of work](https://github.com/socketstream/socketstream/blob/master/TODO.md) to do to finish features and improve existing code.

Please share your thoughts on our [Google Group](http://groups.google.com/group/socketstream) after reading [TODO.md](https://github.com/socketstream/socketstream/blob/master/TODO.md) (updated regularly).

The previous stable version of SocketStream can be found in the [0.2 branch](https://github.com/socketstream/socketstream/tree/0.2). This is the version currently on NPM.


### Introduction

SocketStream is a new Node.js web framework dedicated to creating single-page real time websites.

Unlike traditional web frameworks, there's no routing, AJAX or partials to think about. Instead all application data is streamed over websockets as high-speed bi-directional messages; allowing you to create entirely new ultra-responsive applications that will amaze your users.

SocketStream 0.3 builds on the success of previous versions by introducing more modularity, configurability and extensibility via 3rd party modules. It is designed to work great as both as a stand-alone framework, or when combined with other Node libraries such as Express.js.


## Main Features

#### General

* Designed for large apps - excellent code organization, modularity and extensibility. Not a black box framework
* True bi-directional communication using websockets (or [Socket.IO 0.8](http://socket.io) fallbacks). No more slow, messy AJAX!
* Write all code in [CoffeeScript](http://jashkenas.github.com/coffee-script/) or JavaScript - your choice
* New in 0.3: Works great with [Express.js](http://expressjs.com) and other Connect-based frameworks!
* Easily share code between the client and server. Ideal for business logic and model validation (see README below)
* Effortless, scalable, pub/sub baked right in - including Private Channels
* New in 0.3: Websocket Middleware - enabling session access, user records, authentication, logging, distributed requests and more
* API Trees - offer a simple, consistent way to namespace and organize large code bases
* Optionally use [Redis](http://www.redis.io) for fast session retrieval, pub/sub, list of users online, and any other data your app needs instantly
* New in 0.3: Modular transport design allow alternative websocket or back-end event transports to be used
* Uses [Connect 2.0](http://senchalabs.github.com/connect/) - hook in 3rd-party middleware or write your own
* MIT License

#### Client Side

* Works great with Chrome, Safari __and now Firefox 6__ using native websockets
* Compatible with older versions of Firefox and IE thanks to configurable fallback transports provided by Socket.IO
* New in 0.3: Define multiple single-page clients by choosing the CSS, JS and client-side templates you wish to serve
* Integrated asset manager - automatically packages and [minifies](https://github.com/mishoo/UglifyJS) all client-side assets
* Works with iPads and iPhones using Mobile Safari (iOS 4.2 and above), even over 3G. Send a smaller, lighter client if desired
* New in 0.3: Use optional code formatters (e.g. CoffeScript, Jade, Stylus, Less, etc) by easily installing wrapper modules
* Multiple clients work seamlessly with HTML Push State 'mock routing' so you can use [Backbone Router](http://documentcloud.github.com/backbone/#Router), [Davis JS](http://davisjs.com) and more
* New in 0.3: Support for many client-side template languages (Hogan/Mustache/CoffeeKup/jQuery), including server-side compiled templates
* New in 0.3: Works great with [Ember.js](http://emberjs.com) for 'reactive templates' which automatically update when data changes 
* Bundled with jQuery - though not dependent on it. Will work great with Zepto and other libraries
* Easily add additional client libraries such as [Underscore.js](http://documentcloud.github.com/underscore/)
* Highly Experimental: Designate client-side code files as modules and require() them as you would server-side code


### Requirements

[Node 0.6.X](http://nodejs.org/#download)


### Getting Started

Ready to give it a whirl? Until 0.3.0 is released and published to `npm` you will need to clone the project locally:

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

Note: We are aware there is a strange mix of JavaScript/CoffeeScript created at the moment. This will be fixed shortly. The plan is to create vanilla JS files by default with the ability to type `socketstream new -c <name_of_your_project>` if you prefer to use CoffeeScript.


### How does it work?

SocketStream automatically compresses and minifies all the static HTML, CSS and client-side code your app will ever need and sends this through the first time a user visits your site.

From then on all application data is sent and received via the websocket (or Socket.IO fallbacks), instantly established when the client connects and automatically re-established if broken. Normally this will be in JSON RPC format, but SocketStream 0.3 allows you to use different message responders depending upon the task at hand.

All this means no more connection latency, HTTP header overhead, or clunky AJAX calls. Just true bi-directional, asynchronous, 'streaming' communication between client and server.


### What can I create with it?

SocketStream is a perfect fit for all manner of modern applications which require real-time data (chat, stock trading, location monitoring, analytics, etc). It's also a great platform for building real-time HTML5 games. However, right now it would make a poor choice for a blog or other content-rich site which requires unique URLs for search engine optimization.


### Demo Apps

SocketStream 0.3 example apps coming soon!


### Example 1: Basic RPC

SocketStream 0.3 supports multiple ways to send messages to and from the server. The most common of which, JSON-over-RPC, is included by default. An RPC call can be invoked on the server by calling ss.rpc() in the client.

For example, let's write a simple server-side function which squares a number. Make a file called /server/rpc/actions/app.js and put this in it:

``` javascript
exports.actions = function(req, res, ss){

  // debug or modify incoming requests here
  console.log(req);

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

Now let's write some code in the client to do more with this response. Make a file called /client/code/main/app.js and put this in it:

``` javascript
// define the number to square (vars are local to this file by default)
var number = 25

// ensure SocketStream has connected to the server
SocketStream.event.on('ready', function(){

  ss.rpc('app.square', number, function(response){
    alert(number + ' squared is ' + response);
  });

});
```

Refresh the page and you'll see an alert box popup with the following:

    25 squared is 625
    
More examples coming soon!


### Changes since 0.2

SocketStream has been completely re-written and re-implemented since 0.2. The many changes include:

* SocketStream deliberately does less in the core. A lot less!
* The app directory structure has been changed to support multiple single-page clients and websocket responders
* The internal RPC (ZeroMQ) layer concept in 0.2 has been abandoned. It was too complex. There are better ways to distribute incoming requests to other processes and this will be a major focus for the future
* `SS.server()` is now `ss.rpc()` client-side and no longer autocompletes API functions (see below)
* This new format allows you to write your own message handlers, e.g. `ss.model()`, `ss.backbone()`
* app/shared is no more but you can easily `require()` the same module in both client and server-side code. See FAQ below
* Server-side RPC actions no longer take the `cb` argument but respond using `res()` instead
* Eliminated 'reserved variables' (e.g. `@session`) and the error checking around them via greater use of closures
* Eliminated need to use fat arrows `=>` (binded object vars) within your server-side code
* Solved known issue with 0.2 of new files in /lib/client not loading by serving all files live
* Awesome new SocketStream logo. Many thanks to Craig Jordan Muir.
* Sending events to channels is now far faster at large scale (hash tables rather than iterating through the tree)
* All RPC functions and events can now take multiple params in both directions and require fewer bytes per message
* HTTPS support is no longer a 'feature' of the framework but can easily be achieved in your app (see Tour slide)
* SocketStream no longer auto-restarts when server code is changed. Use `nodemon` instead (see FAQ below)
* CoffeScript, Jade and Stylus are still our preferred languages for writing JS, HTML and CSS respectively, but are now out of the core and supported via optional wrapper modules. Easily write your own wrapper for other languages.


### Questions?

##### Where's all the documentation?

It's coming soon. For now please look at http://www.socketstream.org/tour for real code examples. 0.2 documentation is sadly almost all out of date now.


##### What's happened to the HTTP API?

It's not supported for now. Not because we don't want it (we still fully believe writing the API first is a great idea and a killer feature of SocketStream 0.2), but now we have multiple websocket responders, the decision of where and how to implement the HTTP API layer is little more complex. We will keep giving this some thought. Ideas welcome.


##### What's happened to the Users Online functionality?

It is no longer included in the core for a few reasons: 1) Not everyone needs it, 2) Our current implementation requires Redis to be running, 3) There are multiple ways to work out how many people are online and push/pull the result to the client. We have extracted the old functionality into a separate add-on module which will be released shortly.


##### What's happened to 'socketstream console' (the REPL)

The command has gone. However we are still keen to have a interactive console which allows you to test publishing events and more. We've not finished working on this yet but if you run `node console` from within your app directory you will see where we are so far.


##### How come calls to ss.rpc() don't autocomplete like calls to SS.server() in SocketStream 0.2?

This 'feature' has not been implemented yet and I'm not sure if it will be. It means more code complexity and a slight delay when your app loads as the browser has to build an API function tree. If people really miss this feature it could be brought back with an optional config param. Let me know.


##### How can I make my app auto-restart when /server code changes (as in SocketStream 0.2)?

Install the excellent 'nodemon' module with `sudo npm install -g nodemon` then start your app with `nodemon app.js`. Very useful when developing your app.


##### Will it run on Windows?

Early adopters have reported good results so far, though we still have some work to do to smooth out the rough edges. Please see the Windows installation instructions in INSTALL.md


##### Why not use Require.js, AMD or Browserify?

Right now we're starting off with a much more lightweight solution (about 5 lines of code) which behaves identically to the require() command server-side (at least it will once we implement relative ./ ../ paths). It is not a perfect solution yet but it feels like the right direction to go in given SocketStream already takes care of all the bundling. We will fully document client-side module loading soon.


##### How can I configure Socket.IO?

Like so:

    ss.ws.transport.use('socketio', {io: function(io){
      io.set('log_level', 4)
    }})



##### How can I share code between client and server?

After much thought we decided to abandon the app/shared directory concept in SocketStream 0.2. Thankfully now that we support client-side modules there is a cleaner alternative:

Make the code you wish to share a module (by exporting functions and vars) and save it in `client/code/modules`. You can then `require()` the module in both your client-side and server-side code.


##### Should I use Redis?

Yes. SocketStream installs the Redis driver by default but does not require Redis to be running when developing your app (for convenience sake). However, as soon as you want to host your app for real, you need to be using Redis.

Redis is used in two areas of SocketStream - session storage and internal pubsub (used by ss.publish commands). You can enable Redis in your app with the following commands in your app.js file:

    ss.session.store.use('redis');
    ss.publish.transport.use('redis');

Pass any config as the second argument to either of the above commands as so:
    
    {redis: {host: 'localhost', port: 6379}}



##### How about scaling?

SocketStream 0.3 makes a big assumption in order to maximise speed and reduce code complexity: All incoming connections with the same session should be routed to the same server (also known as Sticky Sessions). The session details are stored in memory and then optionally saved to Redis to preserve the session should the node fail.

Front end scaling can be achieved using a combination of different websocket transports (such as the bundled Pusher Pipe) and optional features we intend to introduce in the future.

Back end scaling has yet to be properly documented, but we're keen to continue looking into ways to use ZeroMQ and also Hook IO. We will make sure back end scaling is as easy and flexible as possible, but it will no longer be a feature of the framework itself.


##### How come X isn't implemented?

Please check TODO.md and let us know if you miss something from 0.2 that's not on the list.


##### Will there be a 0.2 to 0.3 migration guide?

Yes, once the 0.3 API is stable. Right now things are likely to change.



### Developing on the SocketStream core

SocketStream is primarily written in CoffeeScript which is 'pre-compiled' into JavaScript using `make build`. If you're actively developing on the code make sure you install the dev dependencies first (just clone the project and type `sudo npm link`).

To avoid having to continually type `make build` every time you make a change, pass the `SS_DEV=1` environment variable when running your SocketStream app:

    $ SS_DEV=1 node app.js

Your app will then directly read code from your local SocketStream repository's /src directory. This means when you make changes to the SocketStream core, you only need to restart your app to see them.


### Testing

We want to have tests for each internal module written in Mocha once the final design and API settles down. These can be run with `make test`. Help very much appreciated in this area.


### Contributors

Creator and lead developer: Owen Barnes.

Special thanks to Paul Jensen for contributing code, ideas and testing early prototypes. Big thanks also to Addy Osmani for help with everything JavaScript related, Alan Milford for the excellent SocketRacer.com demo (which will be running on SocketStream 0.3 soon!), and Craig Jordan Muir for designing the awesome new SocketStream logo.

Thanks also to the many who have contributed code to 0.1 and 0.2. We plan to properly feature contributors on our website in the near future.


### Credits

Thanks to Guillermo Rauch (Socket.IO), TJ Holowaychuk (Stylus, Jade), Jeremy Ashkenas (CoffeeScript), Mihai Bazon (UglifyJS), Isaac Schlueter (NPM), Salvatore Sanfilippo (Redis) and the many others who's amazing work has made SocketStream possible. Special thanks to Ryan Dahl (creator of node.js) for the inspiration to do things differently.


### Thanks!

SocketStream is kindly sponsored by AOL.


### License

SocketStream is released under the MIT license.

