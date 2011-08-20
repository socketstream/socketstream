0.2 beta / 2011-08-20
=====================

* After much experimentation, session data is now cached on front end servers (synced over ZeroMQ) as well as in Redis (allowing your session to hop from one front end server to another). This has brought us the following benefits:
*   dramatically reduces the load on Redis, increasing response times
*   gives you access to all session data within server-side events
*   allows the exports.authentication = true check to function correctly
*   best of all: allows us to bring back the @session variable without needing to use nasty callbacks! (@getSession will be removed in 0.3)
* Introduced new @request object available to all /app/server methods to access request meta data. See /doc/guide/the_request_object.md
*   @request.post now returns a new object allowing you to access any POST data sent to the HTTP API
*   @request.origin shows where the request originated from (currently 'socketio' or 'api')
* You may now optionally rename the @session, @request and @user reserved variables using SS.config.reserved_vars
* Added many more optional callbacks to session methods (such as session.setUserId) to aid fast automated testing
* Moved and updated the 'Session' section from README to its own page in the emerging new user guide /doc/guide/sessions.md
* Documented storing custom session attributes inside @session.attributes in /doc/guide/sessions.md
* Changed reset.css to normalize.css when making a new project (https://raw.github.com/necolas/normalize.css/master/normalize.css)
* Off-loaded much more work onto Socket.IO 0.7, simplifying SocketStream as a result
* Bugfix: 'socketstream console' no longer responds to incoming ZeroMQ messages
* The /config/http.coffee file is now optional
* Started a new page in /doc/guide/rpc_spec.md describing the internal JSON RPC protocol we use
* Internal JSON RPC calls are now versioned to support staggered upgrades in the futures
* Auto browser reload when in development mode is now more reliable but not yet perfect, hence off by default
* Socket.IO server and client upgraded to latest 0.7.9
* File names inside /app/client can now contain dashes/hyphens

0.2.0 is almost complete now. Just some more work left to do around ZeroMQ, Node 0.5 and Authentication. If you don't mind living on the edge, now is a good time to start using 0.2 with your projects. Please let us know if you spot any bugs.


0.2 preview / 2011-08-10
========================

* /app/server methods can now take multiple arguments, though the HTTP API continues to pass multiple params to the first arg as an object
* Changed error messages you get when passing incorrect arguments (and written specs for this in an external project for now)
* Socket.IO server upgraded to 0.7.8
* Socket.IO client upgraded to 0.7.5 (latest). Minified version included for the first time
* Now loads SS.events (server-side) before /app/server code so you may emit your own custom events
* Now works properly with Subversion (no longer tries to load .svn dirs into the API tree)


0.2 preview / 2011-08-07
========================

Major changes since 0.1. See full announcement here: https://github.com/socketstream/socketstream/blob/0.2/doc/annoucements/0.2.md

All archived history on 0.1 branch
