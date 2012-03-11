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
