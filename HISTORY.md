<a name="0.4.2"></a>
0.4.2 (2015-04-27)
===================


#### Bug Fixes

* **templates:** bug with old template engines getting passed root rather than socketstream api ([19510e35](https://github.com/socketstream/socketstream/commit/19510e350cb7a8e0cf70b749ee8c0b3c5def2d7f))


#### Features

* **bundler:** clarify system module entries loader, libs, start ([4146ec28](https://github.com/socketstream/socketstream/commit/4146ec28c88ced01e019365806df04f31a215d73))
* **pre-commit:** jshint must pass to commit ([34017ff2](https://github.com/socketstream/socketstream/commit/34017ff2ab579ec7c6639df5327b9b476fee08d3))


<a name="0.4.1"></a>
0.4.1 (2015-04-21)
===================


#### Bug Fixes

* **dev:** bundler can supply Buffer rather than string for module content ([15e6af75](https://github.com/socketstream/socketstream/commit/15e6af75e7162bdc5d599be59d6d151fc4eeaddd))
* **docs:** prepend and connect3 re #527 ([61b40825](https://github.com/socketstream/socketstream/commit/61b408252ecd00ee73e8d989881271e314cdd27d))
* **merge:** fixed merge mistake ([e3826ed5](https://github.com/socketstream/socketstream/commit/e3826ed5b33c247eb4ce20f281f0d6a5cf9f582d))


#### Features

* **bundler:**
  * ss.bundler.systemModules() returns all ([a1114433](https://github.com/socketstream/socketstream/commit/a111443351a7f07fb0e6c0c7573a405c3fb51f71))
  * revised constructor and define calls of custom bundlers ([1caf28a5](https://github.com/socketstream/socketstream/commit/1caf28a5b852d1fd264b7ecfba13f20360004711))


<a name="0.4.0"></a>
0.4.0 (2015-04-12)
===================


#### Bug Fixes

* **browserify:** essential test coverage, and require working for directories ([2a41ea95](https://github.com/socketstream/socketstream/commit/2a41ea95804d52444108955bc1041288ab94aba3))
* **bundler:**
  * assets URL, client ref ([3101bce0](https://github.com/socketstream/socketstream/commit/3101bce0a385579f37844aa36024904a8c8be535))
  * packing initCode ([ecfe64f2](https://github.com/socketstream/socketstream/commit/ecfe64f2287e5eb843087e4caca06a12c46ad593))
  * fix _serveDev typo ([694aa221](https://github.com/socketstream/socketstream/commit/694aa2213819a6ffc47326f5e9bcb2c32c7476ae))
* **client:** http require provides the serveClient API ([1dde4e09](https://github.com/socketstream/socketstream/commit/1dde4e098464a06e4ae4ecda89350398085eeaf2))
* **cookie:** cookie configuration in http strategy ([72d6c631](https://github.com/socketstream/socketstream/commit/72d6c63189fb0f9f3b1a8de4adb29009529ef88d))
* **dev:** get entry for /code/.. not code/.. ([33fba3b9](https://github.com/socketstream/socketstream/commit/33fba3b96ab277d224eb7b057adae84380e9e478))
* **docs:** engine generate ([3482973e](https://github.com/socketstream/socketstream/commit/3482973e2873e03352a0e5c7a6fb616d4e6a4032))
* **error:** Better error ([60883a42](https://github.com/socketstream/socketstream/commit/60883a422dd743fbb7193cdb511673a2f4a3b952))
* **lint:** trying to fix hound comments ([34b5e774](https://github.com/socketstream/socketstream/commit/34b5e7744e87d7741de4253f4f8f987c24cc49c8))
* **packed:** Pack 0 assets ([e0d01833](https://github.com/socketstream/socketstream/commit/e0d018334e968e6a9fdb631661b8e2e384ab1ef2))
* **serve:** serve system module ([91ddaa4d](https://github.com/socketstream/socketstream/commit/91ddaa4d4106b54e8dae3ee14c2fbe32cbea3f7b))
* **tests:**
  * using common abcClient test util ([38154fb6](https://github.com/socketstream/socketstream/commit/38154fb6468086cbaff6dc4b84928e82539347c3))
  * conflicting file names ([6565a9c0](https://github.com/socketstream/socketstream/commit/6565a9c0bd91c44e9169825550a0f59ad6af6d9e))
  * mock ss.publish in tests ([64247faa](https://github.com/socketstream/socketstream/commit/64247faa1f61f57b93fe176940cf9ee4ee42cc6c))
  * wrong paths ([9a1acd10](https://github.com/socketstream/socketstream/commit/9a1acd10087cba07c5936b2a67810b5737ab580f))
  * forgot updates for startInBundle ([080abcaa](https://github.com/socketstream/socketstream/commit/080abcaaa31441af750ffdebba9d91748ea2a0dd))
  * system assets ([79544853](https://github.com/socketstream/socketstream/commit/795448539d9def98185cbc7a9e626eeb01688bb6))
  * send modules ([588cf84c](https://github.com/socketstream/socketstream/commit/588cf84c91bd27ce3abc095b46b26beb135bbf4f))
  * system assets ([148369b6](https://github.com/socketstream/socketstream/commit/148369b63074dc6c825b6622afa95088a21185ea))
* **unload:** unloading functions ([17356a3b](https://github.com/socketstream/socketstream/commit/17356a3ba1a1fdc529c8c0529340b8040f78248e))
* **view:** correct formatter used for view ([5bc2a05d](https://github.com/socketstream/socketstream/commit/5bc2a05db6f5f62ac85b557f1662e69ad5c0796e))
* **worker:** fixed serving worker files ([1a5c91f4](https://github.com/socketstream/socketstream/commit/1a5c91f408712a9ceccbe216cd092a26d2309ef8))
* **wrap:** support system library subdirectories ([669f000a](https://github.com/socketstream/socketstream/commit/669f000ae9bc22df87b1fb8f064f2c4877d8722a))


#### Features

* **assets:**
  * missing file ([0e82774f](https://github.com/socketstream/socketstream/commit/0e82774f443705366e90eb2de04be3b1d835078f))
  * URL scheme for assets ([fc93d394](https://github.com/socketstream/socketstream/commit/fc93d394d4405cdfa57c005dff38eb1ebef42424))
* **entry:** entry point is added to startCode rather than sent with system assets ([aaea0d95](https://github.com/socketstream/socketstream/commit/aaea0d95941489763e60d4d2d65a5a05a6618476))
* **browserify:** browserify in default bundler loader ([fb162bd3](https://github.com/socketstream/socketstream/commit/fb162bd37405f6b4f82f622cb0722d18733bf638))
* **bundler:**
  * bundle vs extension vs assetType ([498d9c86](https://github.com/socketstream/socketstream/commit/498d9c861a0b861a8380ba10b15ed9181eedd470))
  * simple api, module, asset ([cfa3f65e](https://github.com/socketstream/socketstream/commit/cfa3f65e6691de42d38e1de0445dc5d9216b7bb0))
  * entries have extension ([55bbe799](https://github.com/socketstream/socketstream/commit/55bbe79928a5ccbddf56bc0f24eb3bb061668209))
  * better systemModule ([ee1dd954](https://github.com/socketstream/socketstream/commit/ee1dd954b083e131d160952d248ffcfbc4cc8522))
  * pass system.assets to entries ([4999e767](https://github.com/socketstream/socketstream/commit/4999e76725519269790fde3323b1f80d8c95a1a2))
  * system modules are named without JS extensions ([7fd3833c](https://github.com/socketstream/socketstream/commit/7fd3833ceb6fb86ccd8ef83e0f56b38af0b4ed1b))
  * view with tags ([510fb53e](https://github.com/socketstream/socketstream/commit/510fb53e4a53e7be36d4b91282526d0792dfefba))
  * Pack & System Assets serving in bundler ([9b7cb47e](https://github.com/socketstream/socketstream/commit/9b7cb47e30d99dc409328c4e24e17d995655d489))
  * Dropping global-require ([6f0b391b](https://github.com/socketstream/socketstream/commit/6f0b391bd288363a74915a125ce57e6c2881b910))
  * Improved bundler api ([4c4313e6](https://github.com/socketstream/socketstream/commit/4c4313e66f0a500b16baa25d8964cd45ff0dc529))
  * ss.bundler.asset.launch ([e6cb07b9](https://github.com/socketstream/socketstream/commit/e6cb07b9ef511adeed39f39a5f1a8752f97669c2))
  * client.includes needed for now ([94b86e7b](https://github.com/socketstream/socketstream/commit/94b86e7b4750c4d92b62f250b593dbbef5eb74f0))
  * tmpl: '*' ([8788aeec](https://github.com/socketstream/socketstream/commit/8788aeec9aa422b5dc8b620489d8d4ce4c323a94))
  * Assets relative to /client ([06433771](https://github.com/socketstream/socketstream/commit/0643377160faa3748d1ebf0040e55f407a63bee8))
  * Alternate bundler ([f99eb5fe](https://github.com/socketstream/socketstream/commit/f99eb5fead9d4e49dc61f7f532932d5c1542d0db))
  * Manage saved asset files ([ca55b5da](https://github.com/socketstream/socketstream/commit/ca55b5daa4a5ca98718d6ce4df0119af29dc4478))
  * Bundlers have common implementation methods ([aea18d25](https://github.com/socketstream/socketstream/commit/aea18d25e8365532ef48680ba4ef5d5d4879f5af))
  * Use default bundler in the client ([cf7641c4](https://github.com/socketstream/socketstream/commit/cf7641c4ca62a1d34dc2bc8c1d143746f204ab3c))
* **client:** unload and forget calls ([d1beae04](https://github.com/socketstream/socketstream/commit/d1beae0417f232db0fdf2fd2d79b707288c70267))
* **constants:** constants set by bundler ([851dabe0](https://github.com/socketstream/socketstream/commit/851dabe07da39a21dc9ddc6659ac61c946652f76))
* **dev:** dev serve /assets ([a22d5fc6](https://github.com/socketstream/socketstream/commit/a22d5fc6f2ff76b704ca8f34523695f8a8f952c3))
* **entry:** first client module with entry.* ([f5dd8799](https://github.com/socketstream/socketstream/commit/f5dd8799c5d524985ffcdbbcf4b8716821b7d1b9))
* **formatter:** builtin formatters ([ae962a6f](https://github.com/socketstream/socketstream/commit/ae962a6f0027dd9a3a0d41dafa89555b425dea3b))
* **id:** unique client id can be used to look up bundler ([c5adac7e](https://github.com/socketstream/socketstream/commit/c5adac7e0a7c2bade6e826cb79f4c8f746fa2555))
* **loading:** better entry module loading ([5d232018](https://github.com/socketstream/socketstream/commit/5d2320188f90f9d228811f459ef43309f3f2eb9f))
* **locals:** can define locals for client and pass to formatters ([248c1ab2](https://github.com/socketstream/socketstream/commit/248c1ab281b49fa81469cd1c0deddcb7bfe2bda9))
* **log:**
  * log is no longer a function ([be857ae2](https://github.com/socketstream/socketstream/commit/be857ae2be4df25abf71ac69009bf05975fab6cf))
  * Expose logging to formatters ([1c238796](https://github.com/socketstream/socketstream/commit/1c23879649e7001180f42b9fa5bebef7578b64de))
* **logging:** log and serve formatting errors ([21ec301a](https://github.com/socketstream/socketstream/commit/21ec301a95b90b441e35f63034f3ad8ae908c619))
* **shim:** Dropping JSON shim ([bd7ab276](https://github.com/socketstream/socketstream/commit/bd7ab276c0a94884304a42656bae62083a5b0c7e))
* **start:** Start Code at end of view ([19442e69](https://github.com/socketstream/socketstream/commit/19442e694e1d33f3b4ea932650917c4e76a2f887))
* **templates:** selectEngine for relative and absolute paths ([3009f493](https://github.com/socketstream/socketstream/commit/3009f4934b48120998c91ec5be3526337ed44ee7))
* **webpack:** webpack bundler exceptions fixed ([f7ed22a9](https://github.com/socketstream/socketstream/commit/f7ed22a932437a9de8a6bc9c633dbe20c1802add))


#### Compatibility

* **log:** log is no longer a function ([be857ae2](https://github.com/socketstream/socketstream/commit/be857ae2be4df25abf71ac69009bf05975fab6cf))
* The browserify.js require implementation no longer looks for 'node_modules' paths. This feature makes little sense in
the browser, and goes against a principle of simplicity. The require lookup is now small and simple. 1) File 2) Directory 3) System



0.3.11 / 2014-10-15
===================

* Add `ss.api.log` unified logging API
* Users can now pass the NODE_ENV to set the environment
* Updated jade templates
* Fixes and updates
* Allow setting your own cookie parser secret
* Dropped support for 0.8
* Replaced grunt tasks with npm run tasks


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
