TODO
====

#### WORK TO DO BEFORE 0.3.0 CAN BE RELEASED

* Build interactive 'socketstream new' asking if you want to use our recommended stack + demo or a vanilla/minimal install
* Much more error checking around sending bad RPC calls (e.g if a module or function does not exist)
* Websocket responders need to take a config object. It should also be able to send config to client-side code (hard)
* Relook at client-side code / modules. Make require() in client-code take relative paths (./ and ../) like Node's require() can
* Look into using Engine.IO instead of Socket.IO
* SocketStream should pass its version number and other meta info to wrapper modules
* Look into ways we can use multi-core cluster features of Node 0.6, if at all (maybe best at app level?)

Help with any of the above tasks would be appreciated. Please get in touch


#### WORK TO DO ONCE 0.3.0 IS RELEASED

* Finish and release HTTP API module
* Finish and release Users Online module
* Finish and release Pusher Pipe transport module
* Finish converting SocketRacer to 0.3 and demo new telemetry websocket responder module


#### DECISIONS TO MAKE

* Sort out how we're going to do configuration and logging. There is very little of either at the moment!
* Should we show a 404 if a request is invalid? (i.e. not a file or cannot be routed to a client)
# Should we use Connect Router or Director (from flatiron) instead of a simple EventEmitter for HTTP routing?

Any thoughts on the above are most welcome


#### DOCUMENTATION

* Lots!!
* Show how to handle websocket connections / disconnections in README


#### SOCKETSTREAM.ORG WEBSITE

* Lots!!
* Show all code examples in the tour in JS of CoffeeScript (toggle switch)
* Give each tour slide it's own unique ID so you can link to it
* Start work on proper documentation (once the API settles)
* Build a page to properly honor contributors