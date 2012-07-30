# Writing your own Request Responder

Note: This documentation is aimed at developers who are comfortable creating Node.js modules and wish to extend the core functionally of SocketStream. Writing Request Responders is going to become **a lot** easier in SocketStream 0.4.


### Introduction

SocketStream is bundled with two Request Responder modules by default: `rpc` and `events`.

For many applications these two responders maybe all you need; however, SocketStream gives you the flexibility to write your own responder as an external module.

You may wish to write your own responder to:

* Experiment with new ways to access model data from the browser (e.g. implement a MongoDB-esq client-side API)
* Investigate the best way to implement model synching to a persistent store (for Backbone.js, Ember.js, or others)
* Develop an ultra low-bandwidth custom protocol for high-speed action gaming (no need to use JSON)
* Make the client send a regular heartbeat to the server (to obtain presence info or calculate users online)
* Log browser clicks, mouse movements, errors encountered, etc and send the data to the server in the most efficient way
* Explore streaming pub/sub event streams, 'ZeroMQ in the browser', or any other experimental concepts

We will feature the best third-party Request Responders on our website, www.socketstream.org, in the near future.


### What exactly is a Request Responder?

A Request Responder is basically a message handler.

Think of the websocket as a pipe with many different types of messages continually flowing in both directions. Each Request Responder module used by SocketStream is assigned a unique ID (the `responderId`) which is automatically prepended to each incoming and outgoing message.

For example, assuming the `rpc` responder was the first to be loaded (and hence assigned an ID of 1), a typical incoming message destined for this responder would look something like this:

    1|{id: 1, m: 'method.to.call', p: [param1, param2, ...]}

Note the `responderId` is sent before the pipe (`|`) character.


### Getting Started

Request Responders are simply regular Node.js modules which you can easily create and publish on NPM. To help you get started quickly, we've made an ultra-simple example called `echo` which you can clone from Github and extend as you wish:

    git clone https://github.com/socketstream/ss-echo-responder.git


### Adding a new responder to your app

Request Responders are added to your application stack by passing a module to SocketStream, as so:

```javascript
// in /app.js
ss.responders.add(require('ss-echo-responder'));
```

Any optional config can be passed directly to the responder by passing an object as the second argument.


### Message Serialization

Each Request Responder sends and receives messages as a `string`; giving you, the developer, complete control over the message length and format.

For complex messages (involving objects) you'll probably want to serialize each message using JSON, as we do with the `rpc` responder. However, if you're just sending basic numeric data (e.g. an ID + X/Y coordinate for a character moving around a virtual world), sending a few groups of digits separated by commas will result in fewer bytes over the wire and no JSON overhead.

Note: Even if you choose not to use JSON, if you were to packet-sniff the websocket connection, you'll notice Socket.IO still uses JSON as part of it's own internal message protocol. In the future SocketStream will support additional Websocket Transports allowing you to pick and choose the best combination of transports and responders for your particular use case.


### Sending Code to the Client

The Request Responder API allows your module to send client-side JS libraries (e.g. `backbone.js`), custom modules, and arbitrary JavaScript code to the browser before any application code is sent.

SocketStream automatically handles the packing/minification of any client-side code when the end user runs the app in `production` mode, but please be **very** conscious that every byte of client-side code you send will increase the load time of the app.


### Registering a Client API

Should you wish to register a function on the main `ss` object (in the same way we do with `ss.rpc()`), you may call `ss.registerApi()` in your client-side code (see the `ss-echo-responder` for an example). How you choose to implement the client-side API is left entirely up to you.

For example, the `rpc` responder allows you to call `ss.rpc('my.function.name', param1, param2, ...)` which takes an unlimited number of incoming arguments and transforms them into a JSON-serialized message.

You may view the source code of the `rpc` responder here: https://github.com/socketstream/socketstream/blob/master/src/request/responders/rpc


### Request Middleware

Request Middleware defined in `/server/middleware` is passed through to all Request Responders and is available for use if you desire.


### RPC-style Callbacks

Request Responders simply allow you to pass messages (as strings) from the client to the server, and vice versa.

Implementing non-blocking bi-directional async message responders is possible (and relatively simple) by appending an sequential ID to each outgoing message and implementing a simple callback stack. This is exactly what we do with the built-in `rpc` responder. Take a look at the annotated source code here for inspiration:

https://github.com/socketstream/socketstream/blob/master/src/request/responders/rpc/client.coffee


### Namespacing Server-side Files

If your Responder allow users to create server-side files, for example to define schema for models, put them in `/server/name_of_your_responder`.

We recommend you use the `apitree` NPM module for namespacing (as we do with the `rpc` responder), but the ultimate choice is left up to you - the developer.


### API Status

The Request Responder API in 0.3 is now stable. SocketStream 0.4 will build upon the ideas in 0.3, allowing you to define additional 'interfaces' so your responder can be invoked over the REPL (using `ss-console`), as part of a server-side test suite, or even over HTTP requests.


### Support available!

Please do not hesitate to get in touch if you need help at any stage of the process. Please log a Github issue or find us on IRC (#socketstream channel on Freenode).
