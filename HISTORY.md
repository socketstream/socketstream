0.0.36 / 2011-04-10
===================

* Introducing the SocketStream logo
* Improved new project startup page


0.0.35 / 2011-04-07
===================

* Improved reconnection to server
* Hostname now shown on boilerplate upon server startup


0.0.34 / 2011-04-06
===================

* Bug fixes
* New $SS.config.hostname option allows server to be bound to a particular hostname


0.0.33 / 2011-04-04
===================

* Bug fix
* Improved Redis error checking
* Upgraded jQuery to 1.5.2
* Refactored app generator


0.0.32 / 2011-04-03
===================

* Improved client re-connection code
* /public/images folder now created by app generator
* Added $SS.config.redis.key_prefix variable which defaults to 'ss'
* Updated Socket.IO, Jade and Stylus
* Started work on publish to group and users online (wip)


0.0.31 / 2011-03-23
===================

* Added 'silent message' option to 'remote' command to prevent logging
* Added a section about Logging to the README
* Fixed server-side logging bug


0.0.30 / 2011-03-23
===================

* $SS.env can now be called within the client
* Fixed bug when re-generating client-side files


0.0.29 / 2011-03-23
===================

* Updated and tested npm dependencies
* Better client-side logging: method and params now shown together on same line


0.0.28 / 2011-03-20
===================

* Fixed bug on macs where .DS_Store file would be loaded in Developer mode
* General code tidying


0.0.27 / 2011-03-18
===================

* Added support for a new config file, /config/app.json, which loads first regardless of environment. The environment config file is then loaded and merged if present.
* Major refactoring of client/server protocol to allow new message types and handlers to be registered in the future. Many more comments added


0.0.26 / 2011-03-17
===================

* More refactoring and docs
* More work on Realtime Models. Disabled by default as highly experimental. Can be enabled with $SS.config.rtm = true


0.0.25 / 2011-03-14
===================

* New feature: Refactored model loading code to support nested models in the same way as $SS.server
* New feature: The HTTP API now supports authenticated requests over Basic Auth (over HTTPS when available). See README for details.


0.0.24 / 2011-03-11
===================

* Change: To bind to multiple events client-side use $SS.event.on(event_name, function). This conforms to EventEmitter and SocketIO
* Improvement: A severed connection will now automatically attempt to reconnect, even if no requests are pending


0.0.23 / 2011-03-10
===================

* New feature: Nested client files are now supported. The folder name they are placed in has no effect on the object namespace for now but is likely to in future
* Major Change: The app.coffee client file is no longer a CoffeeScript class (it doesn't need to be) so it should now begin 'window.app ='
* Improved User Authentication section in docs


0.0.22 / 2011-03-08
===================

* Updated README with details on how to use modular authentication within your app
* Made Object.extend recursive
* Refactored session code to support forthcoming authenticated HTTP API
* Bumped Jade release


0.0.21 / 2011-03-03
===================

  * Fixed bug loading multiple files within a nested directory and improved name spacing conflict resolution
  * Added more boiler plate headers


0.0.20 / 2011-03-03
===================

  * Major change: /app/server files should now begin 'exports.actions =' with the all publicly exposed actions listed as before
  * All private methods should now be listed outside of the exports.actions and be in the format 'method = () ->'.
  * New feature: /app/server code now supports nested functions
  

0.0.19 / 2011-03-03
===================

  * Major change: Files in /app/server are now recursively pre-loaded into $SS.server and instantiated upon startup. This allows for:
  * New feature: Invoke any method within /app/server using the console or within other server-side files. E.g. $SS.server.app.square(25, console.log)
  * New feature: Shared files within /app/shared are pre-loaded an accessible the same way using $SS.shared
  * Improvement: Updated banner to reflect pre-loaded files


0.0.18 / 2011-02-28
===================

  * Change: NODE_ENV is now SS_ENV
  * Added info about Environment-based Configuration in README
  * Ongoing work towards Realtime Models and REST support


0.0.17 / 2011-02-23
===================

  * Bug fix: Sort order of client files
  * Improvement: Startup banner now makes it apparent if you're running in HTTPS
  * Ongoing experimental work on Realtime Models


0.0.16 / 2011-02-22
===================

  * Improvement: Replaced Object.extend method


0.0.15 / 2011-02-22
===================

  * Improvement: Internal refactoring and ground work on Realtime Models


0.0.14 / 2011-02-21
===================

  * Improvement: Much better server/client application error reporting and highlighting


0.0.13 / 2011-02-21
===================

  * Improvement: Extending objects in a much better way which won't break mongoose and other libs that iterate over an object
  * Improvement: Redis config debugging


0.0.12 / 2011-02-21
===================

  * Improvement: Incoming events now logged in the terminal even if they originate remotely
  * Bug fix: Bumped uglify-js npm version. Should now install correctly


0.0.11 / 2011-02-21
===================

  * New feature: Added $SS.config.client.remote_prefix option to make it easy to maintain separate versions of your server api (e.g. 'v1')
  * Improvement: More errors now appear red
  * Improvement: SocketStream will fail to start up if JSON app config file is incorrect


0.0.10 / 2011-02-20
===================

  * New feature: Experimental HTTPS support. Switched off by default as currently unstable. Updated README with info.


0.0.9 / 2011-02-20
==================

  * Improvement: Massively refactored server and asset manager. Now much cleaner and starts up faster
  * Improvement: Standardized server and console startup
  * Improvement: New version of Socket.IO
  * Improvement: Tagged recent releases in Github


0.0.8 / 2011-02-20
==================

  * Improvement: Massively refactored boot up procedure to make sure we never load anything unless we need it
  * Improvement: The correct (tested) version of every npm module we need is now loaded automatically by parsing package.json
  * Improvement: SocketStream now will now automatically update your client libs if required when upgrading to a new version
  * Improvement: Full stack trace now sent to the client (in development mode only) when a server error is encountered


0.0.7 / 2011-02-19
==================

  * Improvement: Re-written the Client in CoffeeScript. Many improvements and additional error handling and fault tolerance
  * Improvement: We now get $SS.version from package.json
  * Improvement: Checks you're in a valid SocketStream project directory before starting up
  * Improvement: Better console experience
  * Improvement: Reworked and added new sections to README
  * Change: $SS.config.log_level is now $SS.config.log.level across server and client


0.0.6 / 2011-02-19
==================

  * New feature: Client-side error reporting when you send incorrect requests
  * Improvement: Much more API and Websocket request hardening. Server now far more stable against malformed requests
  * Improvement: Refactored logger
  

0.0.5 / 2011-02-18
==================

  * New feature: Override the default Redis config with $SS.config.redis, and separate pub/sub details if you wish
  * New feature: Startup time displayed on boot
  * Improvement: API hardening. Still much more to do here
  * Improvement: Refactoring of cli, redis, boot up procedure


0.0.4 / 2011-02-17
==================

  * New feature: Start your apps with 'socketstream start'
  * New feature: 'socketstream console'. Try typing $SS.publish.broadcast('my_channel','my message')  Much more to come here!
  * Improvement: Improved error checking within API. WIP
  * Improvement: Recognition of a root URL
  * Change: Create new apps is now 'socketstream new <PROJECTNAME>'


0.0.3 / 2011-02-17
==================

  * New feature: Initial work towards API. remote('app.square', 5) can now also be called by /api/app/square.json?5 (or .html to view on screen). Passed params will be sent as objects. Full error handling and API browsing coming soon.
  * New feature: Configure the client using the 'client' params in your local /config/environments/<NODE_ENV>.json files. E.g. {"client": {"log_level":3}}
  * Improvement: Refactored incoming request code
  
  
0.0.2 / 2011-02-13
==================

  * New feature: Share code between client and server by placing it in /app/shared
  * New feature: jQuery templating. Just add the jQuery tmpl plugin to your /lib/client files then create folders and files within /app/views
  * New feature: Easily override default config with app config files in /config/environments/<NODE_ENV>.json
  * Improvement: /app/vendor directory now optional
  * Improvement: Client-side debugging is now set using the same $SS.config.log_level variable as server-side for consistency
  * Improvement: Refactored to use fewer global variables, more modular, more comments
  * Added this file
  

0.0.1 / 2011-01-14
==================

  * Initial release
