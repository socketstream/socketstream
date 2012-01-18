TODO
====

#### WORK TO DO BEFORE 0.3.0 IS RELEASED (updated regularly)

* Show how to handle websocket connections / disconnections in README
* Build interactive 'socketstream new' asking if you want to use CoffeScript or not
* Need to find a better way to check if an internal module exists. Exception catching hides errors within the module
* Refactor getting sessions from store and socketsByUserId etc. Lots of work to do in this area
* Much more error checking around sending bad RPC calls (e.g if a module or function does not exist)
* Websocket responders need to take a config object. It should also be able to send config to client-side code (hard)
* Make require() in client-code take relative paths (./ and ../) like Node's require() can
* Investigate if it's possible to make SocketStream sessions accessible to regular HTTP requests?
* Make sure it is easy to use Nib (Stylus extension) with SocketStream
* Look into using Engine.IO instead of Socket.IO
* SocketStream should pass its version number and other meta info to wrapper modules
* Look into ways we can use multi-core cluster features of Node 0.6, if at all (maybe best at app level?)
* Ensure we can support CoffeeKup and client-side Jade, using optional 'template engine' modules if required
* Merge Main Features and New Features together in Readme once people have seen the key changes
* Finish and release Users Online module
* Finish and release Pusher Pipe transport module
* Finish converting SocketRacer to 0.3 and demo new telemetry websocket responder module
* Testing! Lots of! We are going to use Mocha

Help with any of the above tasks would be appreciated. Please get in touch


#### DECISIONS TO MAKE

* Sort out how we're going to do configuration and logging. There is very little of either at the moment!
* Do we want to implement the server-side events concept we had in 0.2. Is it worth it?
* Should we show a 404 if a request is invalid? (i.e. not a file or cannot be routed to a client)
* Figure out if / how the old HTTP RPC API should be a part of the SocketStream core
* Can we / should we make RPC middleware inheritable? If so what should the syntax be?
# Should we use Connect Router or Director (from flatiron) instead of a simple EventEmitter for HTTP routing?

Any thoughts on the above are most welcome


#### SOCKETSTREAM.ORG WEBSITE

* Lots!!
* Show all code examples in the tour in JS of CoffeeScript (toggle switch)
* Give each tour slide it's own unique ID so you can link to it
* Start work on proper documentation (once the API settles)
* Build a page to properly honor contributors