TODO
====

* Make 'socketstream new' install recommended stack of optional modules by default, but add a minimal install option
* Websocket responders need to take a config object. It should also be able to send config to client-side code (
* SocketStream should pass its version number and other meta info to wrapper modules


#### WORK TO DO ONCE 0.3.0 IS RELEASED

* Finish and release HTTP API module
* Finish and release Users Online module
* Finish and release Pusher Pipe transport module
* Finish converting SocketRacer to 0.3 and demo new telemetry websocket responder module
* Move to Engine.IO instead of Socket.IO once it's ready
* Look into ways we can use multi-core cluster features of Node 0.6, if at all (maybe best at app level?)


#### DECISIONS TO MAKE

* Sort out how we're going to do logging
* Should we show a 404 if a request is invalid? (i.e. not a file or cannot be routed to a client)
# Should we use Connect Router or Director (from flatiron) instead of a simple EventEmitter for HTTP routing?

Any thoughts on the above are most welcome


#### SOCKETSTREAM.ORG WEBSITE

* Lots!!
* Show all code examples in the tour in JS of CoffeeScript (toggle switch)
* Give each tour slide it's own unique ID so you can link to it
* Start work on proper documentation (once the API settles)
* Build a page to properly honor contributors