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
