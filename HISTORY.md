0.3.10 / 2013-10-07
===================

* Resolved an issue affecting the loading of the library #401.



0.3.9 / 2013-10-04
==================

* Attempting to resolve an issue with missing new_project files in the npm published modules #401.



0.3.8 / 2013-10-04
==================

* Attempting to resolve an issue with missing new_project files in the npm published modules #401.



0.3.7 / 2013-10-04
==================

* Attempting to resolve an issue with missing new_project files in the npm published modules #401.
* Added some empty tests to be completed. 



0.3.6 / 2013-09-27
==================

* Updated Chokidar to 0.6.3 (fixes #365)
* Fixed a bug where files were not being copied correctly when running the new app generator (#400)
* Added some initial tests for the framework
* Added dependency tracking for Node.js modules (thanks RomanMinkin)
* Added back the build status via Travis-CI (thanks RomanMinkin)
* Added fixes for Websockets (thanks polidore)
* Updated engine.io to 0.7.9 (thanks kkoopa)
* Added Grunt for running tests and linting (thanks RomanMinkin)



0.3.5 / 2013-08-13
==================

* Fixed a bug with the Websocket transport wrapper working in Internet Explorer 8
* Fixed a bug where Symlinked directories in client/static/ were not resolved correctly (thanks wrouesnel)
* Added GZIP compression of static assets
* Fixed a bug where client-side socket reconnect prints an error if there is no window.ss (thanks krsch)
* Improved getting x-forwarded-for from socket (Owen Barnes)
* Fixed a bug with the app generator not including some required directories (thanks burninggramma)
* Allow setting of "secure" cookie attribute when using HTTPS
* Set correct clientIp when XFF header is present (thanks SkareCrow)



0.3.4 / 2013-03-13
==================

* Fixed bug preventing Request Responders (e.g. ss-angular) from working
* Push `req.clientIp` from Engine.io to RPC requests as before
* Confirmed working in Node 0.10.0. Be sure to report any bugs if found



0.3.3 / 2013-02-21
==================

* Major change: Now bundled with Engine.IO instead of Socket.IO. This improves support for non-websocket connections and is generally more efficient (big thanks to paulbjensen). Note: If you want to stick with Socket.IO, please avoid this upgrade - the rest of the changes are minor. 

##### Bug fixes

* Improved caching of assets when loading client code on demand (thanks kraz)
* Added `npm start` command to newly generated apps (thanks paulbjensen)
* Report correct client IP address when using a proxy (thanks sveisvei)



0.3.2 / 2012-09-15
==================

* Updated redis to 0.8.1 and connect-redis to 1.4.4 to resolve issues deploying to Nodejitsu (thanks sberryman)



0.3.1 / 2012-08-20
==================

* Added support for inline Angular JS templates. Works in exactly the same way as existing support for Ember JS templates: `ss.client.templateEngine.use('angular');`
* Updated jQuery to 1.8.0

##### Bug fixes

* Configuring Socket.IO using the 'server' param now works as documented (thanks cjm)
* `<SocketStream>` HTML tag is now XML complient: `<SocketStream/>` (thanks orefalo) 



0.3.0 / 2012-08-02
==================

##### Improvements for Production Hosting

* IMPORTANT: `ss.client.packAssets()` now tries to use existing pre-packed assets if present
* If no assets are found, or you pass the env var `SS_PACK=1`, assets will always be (re)packed
* Static assets now have a cache expiry header of 30 days by default. Configurable with `ss.client.set({static: {maxAge: newValue}})` as before
* NEW: CDN paths can now be functions. E.g. `ss.client.packAssets({cdn: {js: function(file){ return "http://mycdn.com" + file.path; } }})`
* In the absence of `process.on('uncaughtException')` in your app code, uncaught exceptions are now sent to the console and will no longer kill the server. This 'safety net' is automatically activated when you call `ss.packAssets()` as you typically would in production
* Any errors encountered serving the HTML view are now sent to the console, not the browser
* Added new 'Best Practices' doc section and new doc file: [Hosting in Production](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/production_hosting.md)


##### Other

* Updated to work on Node 0.8
* Live Reload now uses `chokidar` for better performance on Windows and when creating new files. Big thanks to CyberWalrus
* Updated many package dependencies
* Added documentation in Korean (thanks EngForDev)
* Enable proper handling of question marks and params when routing HTTP requests (thanks matthiasg)
* In newly generated projects `ss.define.client()` now lists client libs explicitly to avoid confusion over load order
* Added ability to call `req.session.setUserId(null, cb)` when a user signs out
* Updated bundled jQuery to 1.7.2



0.3 RC2 / 2012-05-04
====================

* New: Multiple Websocket Transports now fully supported. Switch between Socket.IO (bundled by default) and [SockJS](https://github.com/socketstream/ss-sockjs) (first alpha release) without changing any of your application code
* New: Socket.IO client library can now be configured (see updated example in README)
* Live Reload: Working on fixing issues whilst renaming files in VIM (see #227, thanks madscoaducom), fixed issue saving CSS + normal files together
* Errors in formatting templates (e.g. bad `.jade`) now caught properly
* Any missing sessions are now automatically recreated (useful when developing without using Redis)
* New project example code now uses [Nib](http://visionmedia.github.com/nib) instead of custom Stylus helpers
* Minor refactoring
* Updated README with video link



0.3 RC1 / 2012-04-22
====================

##### New Request Responder API!

* This powerful low-level API will allow SocketStream to support models, reactive templates, user presence, custom low-level gaming protocols and much more!
* Create own Request Responder by [reading the documentation](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/writing_request_responders.md) and [downloading the example module](https://github.com/socketstream/ss-echo-responder)
* Publish your Request Responder module on NPM. The best modules will be featured on www.socketstream.org
* Include any third-party responder in your `app.js` with `ss.responders.add(require('mod-name'));`


##### Other

* IMPORTANT: Removed `console.log` compatibility wrapper for older browsers. See #192 for full explanation
* New experimental server-side testing API. [See docs](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/server_side_testing.md)
* CSS is now minified using `css-clean` when you call `ss.client.packAssets()`. Thanks plievone!
* RPC error stack traces are now only sent to the browser if the request was made from `localhost`
* Improved and updated `ss-console` to 0.1.2. Slight API change: add it to your project with `require('ss-console')(ss);`
* Upgraded Socket.IO to 0.9.6
* Changed a lot of `exports.init` to `module.exports` in line with Node best practice
* Removed code to check for previous versions of 0.3
* Updated `package.json` with names of significant/regular contributors. Thanks guys!



0.3 beta2 / 2012-04-10
======================

##### Improved New App Creation

* Now creates plain HTML, CSS and Javascript files by default
* Pass `-j` for Jade and `-c` for CoffeeScript if preferred
* Pass `-m` for Minimal Install (no chat demo)
* Pass `-r` to include Console Server / REPL
* Plain CSS/Stylus/Less options coming soon
* `package.json` and `app.js` now dynamically created based upon the modules you choose


##### Template Engine improvements

* Breaking change to Template Engine module format
* Template Engine external modules can now deliver client-side code
* Hence the Hogan client-side library has been removed from the core and now included within `ss-hogan` 0.1.3
* `ss-coffeekup` and `ss-clientjade` have also be updated. Please `sudo npm update` to get the latest module
* Template Engine API documentation updated and unlikely to change again


##### Other

* The names of all client-side dirs can now be optionally changed to improve compatibility with 3rd party frameworks. E.g. `ss.client.set({dirs: {code: '/client/code', static: '/public'}})`
* Added support for hosting packaged assets files on a CDN. To use: `ss.client.packAssets({cdn: {js: "http://my.cdn.com/my.js", css: "http://my.cdn.com/my.css"}})`
* Internal Request Middleware now loads even if there is no `/server/middleware` directory present
* Bit of internal refactoring. Be sure to update `ss-console` to 0.1.1
* Upgraded Socket.IO to 0.9.5

Note: Several minor tweaks and improvements will be pushed to master before 0.3.0 is released and published to NPM later this month



0.3 beta1 / 2012-03-26
======================

##### Major improvements to Client Asset Manager

* Massive amount of refactoring to improve code
* Live Reload: CSS changes now only refresh the CSS, not the entire page (thanks cjm!)
* All client code is now properly minified in production
* HTML views (one per client) and `ss.load.code` output is now cached in RAM in production
* `/client/code/libs` and `system` directories can now contain sub-dirs which are treated the same way
* Added `connect.favicon` to the Connect middleware stack
* New internal API for adding client code. Will be documented for use by 3rd party modules in the future
* Static assets are now cached for 30 seconds by default (no caching before). Change with `ss.client.set({static: {maxAge: newValue}})`
* `ss.load` commands no longer allow access to files outside of the correct asset dir
* Better warning message if you put the wrong file in the wrong dir (e.g. a `png` in `/client/css`)
* Due to the large amount of code changed, please check existing projects carefully and report any errors


##### New Feature: Web Workers

* Please see new documentation: [Web Workers](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/web_workers.md)
* Implemented with minimal code. Leverages existing modules


##### API Changes

* `ss.http.router.on` has been shortened to `ss.http.route`. Old API will continue to work
* Optional new short form if you're only serving one client per URL: `ss.http.route('/').serveClient('main')`


##### ss-hogan Module

* ***Breaking Change*** No more global variables (e.g. `HT`) for templates
* Access all templates from 'ss.tmpl' instead of `HT`, assuming you `require('socketstream')` as `ss`
* Tip: Alias 'ss.tmpl' with 'window.HT = ss.tmpl;' in your `entry.js` file if you don't want to change your code


Also: Documentation updates to Client Side Templating & Pub Sub Events



0.3 alpha5 / 2012-03-11
=======================

##### Major improvements to Client-side Code

Please read new documentation on [Client-side Code](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/client_side_code.md) then create a new project to see the updated file structure. Also see the alpha5 announcement on Google Groups if you want a step-by-step migration guide.

Key changes from previous releases:

* All client code files **not** in a directory called 'libs` are now modules by default
* You can now `require()` modules in the browser in exactly the same way as on the server (thanks to code from Browserify)
* Where you currently called `require('mymod')` you will now need to add a leading slash: `require('/mymod')`
* You can now use relative paths such as `require('../../mymod')` as you would on the server
* `ss.loadAsync()` is now `ss.load.code()` but essentially works the same way. See new On Demand Loading doc
* No more mandatory `SocketStream` and `ss` global variables...
* SocketStream is now a system module - make it any global you want or type `var ss = require('socketstream')` at the top of each file if you prefer
* `SocketStream.event.on` is now `ss.server.on`. Event names have not changed
* The `SocketStream` global is no longer needed and has been removed
* An `/entry.js` (or `.coffee`) module is now created by default and must always be present in your app as this is the new single point of entry
* The `ss.client.wrapCode()` command and code wrappers concept are now redundant and the code has been removed

Note: The next release will see further improvements to client-side code and a lot of internal refactoring / cleaning up. At this stage no more breaking changes to your client or server-side code are anticipated.


##### New project installer

* Now creates example code in JavaScript by default
* Install example code in CoffeeScript by passing the `-c` option
* Further enhancements planned here


##### New documentation

* [Client-side Code](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/client_side_code.md)
* [Defining multiple Single-Page Clients](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/defining_multiple_clients.md)
* [Loading Assets On Demand](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/loading_assets_on_demand.md)


##### Other changes

* We are no longer bundling `ss-console` in new apps by default
* You can now disable Live Reload altogether with `ss.client.set({liveReload: false})` in your `app.js` file
* Upgraded deps: Socket.IO 0.9 and Connect 2.0.2



0.3 alpha4 / 2012-02-23
=======================

This release sees the return of two much-loved features from SocketStream 0.2, redesigned and reimplemented to be better than ever.


##### The Console is back!

* Implemented as an optional module, [ss-console](https://github.com/socketstream/ss-console), to keep the core bloat-free
* Installed by default for now when you create a new project as part of our recommended stack (minimal install option coming soon)
* Works by connecting to a running server, rather than starting a new instance of your app
* Invoke any `ss.rpc()` method via the console with exactly the same syntax as in the browser, errors shown in red
* Publish an event over the console with the normal API - e.g. `ss.publish.all('newMessage', 'Hello from the console!')`
* Creates a new session when you start it up, so you can use it with `req.use('session')` middleware
* If you have a `console.js` file in your project it will be deleted as no longer required
* Huge thanks to mindeavor for contributing code and ideas


##### Live Reload is back!

* Automatically detects changes to HTML, CSS and JS files in `/client`
* Sends an event to all connected browsers instructing them to reload the page
* Recognises new files and deleted files - much improved from SocketStream 0.2
* Enabled by default unless you call `ss.client.packAssets()` (i.e. turned off in production)


##### Others

* Rearchitected Websocket Responders/Middleware so they are now called Request Responders/Middleware
* Request Responders now expose multiple interfaces - more work to do here until I'm happy with the API
* Changed `/serveDev` URLs to make it easier to identify which files have errors in the browser (#123)
* Refactored and improved template code. Added tests (mindeavor)
* CoffeeKup templates can now end in `.coffee` (mindeavor)
* Time taken to process each `ss.rpc()` call now shown in ms. Still need to sort out logging options
* Creates a `.nodemonignore` file in new projects so changes to `.coffee` files in `server` cause the server to restart as expected
* Jade templates are now supported in the browser using sveisvei's [ss-clientjade](https://github.com/sveisvei/ss-clientjade) module
* When processing incoming HTTP requests `res.serve` is now `res.serveClient` as it's more descriptive. `res.serve` will remain as an alias for the foreseeable future
* `server/middleware` directory is now optional
* Improved RPC error message handling (work towards #138)
* HTTP Client headers now include length to prevent chunked encoding (#139)
* Re-written 'Introduction' in README
* Added Travis CI integration and build status badge



0.3 alpha3 / 2012-02-09
=======================

##### New Connect-based Session Store and improvements

* Allows seamless sharing of user sessions between HTTP and Websocket requests
* Easily share sessions with other libraries which use Connect such as Express.js
* Integrates with Everyauth so you can easily add Facebook Connect or Twitter OAuth authentication to your app
* Implemented getting/setting custom session variables. Set using `req.session.myVar = 1` then call `req.session.save()`
* Continues to use in-memory store by default for easy development. `req.session` API unchanged
* 'connect-redis' now bundled by default in place of our custom redis session store
* Activate with `ss.session.store.use('redis')` as before, or pass an instance of another Connect session store
* Sessions now expire in 30 days by default (2592000000 ms). Configure with `ss.session.options.maxAge = <valueInMs>`
* `connect.session` middleware now sets session cookie over HTTP instead of via websocket
* Many thanks to nponeccop for providing the initial code and ideas around this major enhancement

##### BREAKING CHANGE: Changed and improved Websocket Middleware

* Moved `/server/rpc/middleware` to `/server/middleware` so middleware can be used by all websocket responders (including forthcoming models)
* Moved contents of `/server/rpc/actions` to `/server/rpc`. Projects in the old format will be detected and you will be helped to upgrade
* No longer uses `exports.before` in /server/rpc. Instead call `req.use()` inside the `exports.actions` function (same API as Connect)
* `m.loadSession()` now becomes `req.use('session')` - see [new doc page](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/websocket_middleware.md) for full details
* Declaring middleware now feels cleaner plus middleware can now be programmatically added to the chain

##### Other Changes

* BREAKING CHANGE: Any Redis config passed to `ss.session.store.use('redis')` and `ss.publish.transport.use('redis')` should no longer be prefixed with `{redis: {}}`
* Fixed bug preventing assets loading when running in production mode for the first time
* Started writing new documentation in `/doc/guide/en` with help from mindeavor
* New syntax for appending/prepending Connect Middleware to the stack - see new [new doc page](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/http_middleware.md)
* Fixed bug in event-based router (nponeccop)
* Now detects session cookie from Socket.IO handshake data instead of sending over WS (closes #133)
* Implemented passing config object in `ss.publish.transport.use()` command (closes #132)
* Improved the way internal modules are detected and loaded (closes #134)



0.3 alpha2 / 2012-02-01
=======================

##### New modular client-side Template Engines

* Supports server-side compiled Hogan templates using the optional `ss-hogan` npm module
* Supports server-side compiled CoffeeKup templates using the optional `ss-coffeekup` npm module
* Supports Ember.js 'reactive' templates - a perfect compliment to SocketStream
* Easily create an template engine module for your preferred template language and share it on npm
* Best feature: Mix and match different types of templates in your project - perfect for experimenting or converting from one to another
* Now bundling server-side Hogan template solution as the default (when creating a new project). Demo updated to demonstrate use of Hogan templates. Note `socketstream new` will create a 'bare-bones' project in the future whereas `socketstream new -r` will install our recommended stack + chat demo
* In the absence of proper docs for templating so far, please look at the Alpha 2 announcement on our Google Group

##### Other Changes

* Tidied up and improved README
* Better resolving of nested routes (with dots in) to single-page clients by caching names of static dirs upon startup
* Warns if you try to define a single-page client which conflicts with the name of a file or folder in /clients/static
* New projects are bundled with reset.css (http://meyerweb.com/eric/tools/css/reset/) as in 0.2 instead of bootstrap.css
* Experimenting with new loadAsync() command to load in additional client-side modules. See post in Google Group
* Any old files in /client/static/assets are now deleted by default. Override with {keepOldFiles: true}
* Backwards slashes (\) replaced with forward slashes (/) in file paths for Windows compatibility (David Rosen)
* Updated INSTALL.md



0.3 alpha1 / 2012-01-14
=======================

Huge changes to pretty much everything since 0.2.7. See README for full details.

All archived history in the 0.2 branch: https://github.com/socketstream/socketstream/blob/0.2/HISTORY.md
