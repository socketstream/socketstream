0.1.8 / 2011-07-24
==================

* Few minor bug fixes:
* session.user.logout() now persists correctly
* Jade compilation errors now caught correctly (aler)


0.1.7 / 2011-07-19
==================

* Updated Stylus lib to allow compatibility with Node 0.5.1 (we still recommend the stable 0.4.x branch for now)
* Removed hiredis dependency to make it easier to use with the Cloud9 IDE. We recommend you install hiredis when possible
* Note: The first alpha release of SocketStream 0.2.0 should be ready within 2 weeks


0.1.6 / 2011-07-15
==================

* New 'Quick Chat' demo when you create a new project. Shows how to bind to events, pass params and broadcast messages
* The 'servers' object is now exposed as SS.internal.servers to allow you to use Connect routing and more in /config/http.coffee
* Uses Jade 0.13.0 which now supports mixins and includes (currently untested)
* Updated other npm dependencies to latest versions
* Note: Development on the 0.1.x branch will slow now as all effort is going into 0.2.x


0.1.5 / 2011-07-12
==================

* API CHANGE: @session is now @getSession and takes a callback (for compatibility with forthcoming 0.2.0)
* @session will continue to work in 0.1.x releases but please update your code
* Fixed annoying bug preventing flashsockets working on port 80 or 443. Doh!
* Messages sent using SS.publish.user() now go to ALL connected clients with that user_id, not the last one to login


0.1.4 / 2011-07-06
==================

* Nested folders are now fully supported in /app/views (for jQuery templates)
* Views and templates can now be in plain old-fashioned HTML - just use the .html extension instead of .jade
* Improved client-side helpers. Added bind method as per issue 26 (addyosmani)
* All client-side helpers now have server-side equivalents, allowing you to use them anywhere
* extensions.js now renamed to helpers.js internally for consistency


0.1.3 / 2011-07-05
==================

* Configuration files are now in CoffeeScript by default, though JS is also supported (paulbjensen)
* JSON-based configuration files are still supported for backwards compatibility, but will be removed in a future release


0.1.2 / 2011-06-30
==================
 
* Added a new client-side helper file (think ActiveSupport in Rails). Checkout the README for full details (addyosmani, paulbjensen)

Bug fixes:

* Multi-byte UTF8 characters now supported by asset packer (elisee)
* We now ensure /public/assets exists on startup (pusewicz)
* OS X Dashboard 'WebClip' user agent now recognised as friendly by the browser_check middleware (paulbjensen)


0.1.1 / 2011-06-24
==================

* Fixed bug in the browser check middleware (was not able to handle headless browsers)


0.1.00 / 2011-06-23
===================

* Final release for SocketStream launch today!
* Greatly improved SSL support. Now fully documented in README
* A secondary HTTP server is now run by default in HTTPS mode to auto-redirect incorrect HTTP requests to the domain specified in the cert
* HTTP API can now be configured to only run in HTTPS using SS.config.api.https_only
* Changes to configuration file. Done now to prevent major changes here later on


0.0.58 / 2011-06-21
===================

* Updated Jade NPM to latest version. NOTE! Params for HTML tags must now be in "height=21" rather than "height: 21" format
* Updated /app/views/app.jade with new syntax


0.0.57 / 2011-06-20
===================

* Refactored HTTP middleware to...
* Allow support for your own high-speed custom HTTP middleware. See README for details/examples
* Updated README with pre-launch details


0.0.56 / 2011-06-19
===================

* VIM backup files (ending with ~) are now ignored (thanks kryton)
* Updated all NPM dependencies (apart from Jade) to latest versions and tested compatibility
* Updated Socket.IO client to 0.6.3
* Added favicon.ico :)


0.0.55 / 2011-06-14
===================

* Refactored HTTP serving to support 'middleware' and allow custom HTTP handling in future
* Added 'Strict Mode' which checks browser for native websocket support. See Incompatible Browsers section in README
* New projects now include a /static directory. This will be used for maintenance pages and other things in the future
* Changed the way new projects are created. A basic /config/app.json file is now included by default
* Added FAQ section to README


0.0.54 / 2011-06-13
===================

* Now works fine if installed as an NPM package as well as 'sudo npm link'
* Minor bug fixes


0.0.53 / 2011-06-08
===================

* Calls to SS.server actions from the browser will automatically output to the browser's console if no callback function is provided (makes testing/debugging SS.server actions much easier!)
* Heartbeats from the client are now sent and processed more efficiently
* The HTML output now lists links to CSS files before JavaScript files, as recommended by the Chrome Audit tool
* Updated the README


0.0.52 / 2011-06-07
===================

* Major update with an IMPORTANT API CHANGE!
* Client files are now namespaced in exactly the same way as Shared files. Existing apps will not break, but look at the README to see the new best practice
* Added very basic rate limiting. This is turned off by default whilst we try it out in the real world, but can be switched on with SS.config.limiter.enabled = true. See new Security section in README
* Improved initial creation of client libs
* A fair bit of internal refactoring
* Added Security and Scaling sections to README


0.0.51 / 2011-05-25
===================

* Errors in client-side .jade files are now caught in development (once new Jade released is pushed to npm)
* Now prevents you from starting a project with an outdated version of SocketStream (can be overridden) 
* Fixed bug preventing /favicon.ico from being served


0.0.50 / 2011-05-24
===================

* Major enhancement: Errors in client-side .coffee and .stylus files no longer kill the server
* A new SocketStream error page is sent instead, showing the backtrace on screen, as well as in the console
* .js files are now fully supported in /app/shared, along with .coffee. Mix and match as you wish


0.0.49 / 2011-05-23
===================

* Fixed bug concerning dropping clients without active sessions
* Added Known Issues section to README


0.0.48 / 2011-05-23
===================

* .js files are now fully supported in /app/client, along with .coffee. Mix and match as you wish
* If a lib file fails to compile it will be automatically regenerated next time - no more empty files
* Refactored code to pre-parse incoming URLs to reduce duplicate parsing later down the line
* Improved API errors
* Lots of other refactoring and minor improvements


0.0.47 / 2011-05-19
===================

* .coffee files can now be placed in /lib/client and will be transparently compiled


0.0.46 / 2011-05-19
===================

* Fixed bug which appears when too many clients disconnect at once


0.0.45 / 2011-05-19
===================

* Fixed bug when attempting to pack assets with no /app/shared directory present
* Included client disconnect/reconnect example actions in generated new project code
* Upgraded jQuery to 1.6.1
* Other minor changes


0.0.44 / 2011-05-18
===================

* Multiple Redis databases are now supported by setting SS.config.redis.db_index. Defaults to 0, the Redis default. Documented in README
* Sessions now extend Event Emitter in order to fire custom server-side code when the websocket connection is lost. Documented in README
* Improved the way errors are thrown


0.0.43 / 2011-05-17
===================

* IMPORTANT API CHANGE: @session.loggedIn() is now @session.user.loggedIn() , @session.logout() is now @session.user.logout()
* Major refactor of sessions and pubsub system to improve readability and allow support for...
* New feature: Private Channels. Publish events to unlimited channels across servers using SS.publish.channel(). See new 'More Pub/Sub' section of README
* SS.server code now be nested up to 1000 levels in one file
* Client now displays a warning if it receives an unregistered event
* Server now warns if attempting to call a reserved action name (currently only 'session' and 'user')
* Tidied up some logging


0.0.42 / 2011-05-12
===================

* Moved noisy 'Updating list of Users Online' messages to new SS.config.log.level of 4
* Converted all internal code to use SS instead of $SS
* Updated README to make it easier to see what the project's about


0.0.41 / 2011-05-10
===================

* Updated NPM packages
* Changed client code to prevent re-calling app.init when the connection comes back up


0.0.40 / 2011-05-06
===================

* Huge improvements to the way Shared code works. Classes are no longer required but are still supported. Added new section to README
* Shared code can now be executed directly from the client via SS.shared (exactly the same syntax as the server :-)


0.0.39 / 2011-05-04
===================

* Added 'Users Online' feature and API to make it easy to create real-time chat/social apps. Documented in README
* Added 'The Road to 0.1.0' in the README
* Removed ability to configure global client-side variable name for now - it's not 100% stable. $SS and SS both work but SS is now recommended.
* Now compatible with NPM 0.X and 1.0 (thanks Paul)


0.0.38 / 2011-04-21
===================

* Major change to the client-side API: The 'remote' global method is deprecated in favour of 'SS.server' followed by the server-side function you wish to invoke.
* Advantages are: 1) A 100% consistent experience between server and client  2) Automatic auto-completion of the server-side API in the browser command line. Woo!
* The window.remote global function will stay around for a while whilst existing apps are converted but will be removed before 0.1.0
* Also: Speeded up initial client/server protocol by combining multiple system messages into one
* Changed the way the app is initialized - no longer requires JavaScript code to be injected into the HTML
* Experimenting with Tim Caswell's client-side module loader. More on this soon


0.0.37 / 2011-04-20
===================

* $SS is now aliased as SS by default in both the server and client, meaning you no longer need the dollar symbol when calling the API
* However, if the SS variable conflicts with something in your project, you may easily change it in the config: $SS.config.ss_var and $SS.config.client.ss_var
* All docs have been updated accordingly. Remember this is just an alias - existing code will not break


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
