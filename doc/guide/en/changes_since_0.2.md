# Changes since SocketStream 0.2

SocketStream has been completely re-written and re-implemented since 0.2. The many changes include:

* SocketStream deliberately does less in the core. A lot less!
* The app directory structure has been changed to support multiple single-page clients and websocket responders
* The internal RPC (ZeroMQ) layer concept in 0.2 has been abandoned. It was too complex. There are better ways to distribute incoming requests to other processes and this will be a major focus for the future
* `SS.server()` is now `ss.rpc()` client-side and no longer autocompletes API functions (see below)
* This new format allows you to write your own message handlers, e.g. `ss.model()`, `ss.backbone()`
* app/shared is no more but you can easily `require()` the same module in both client and server-side code
* Server-side RPC actions no longer take the `cb` argument but respond using `res()` instead
* Eliminated 'reserved variables' (e.g. `@session`) and the error checking around them via greater use of closures
* Eliminated need to use fat arrows `=>` (binded object vars) within your server-side code
* Solved known issue with 0.2 of new files in /lib/client not loading by serving all files live
* Awesome new SocketStream logo. Many thanks to Craig Jordan Muir.
* Sending events to channels is now far faster at large scale (hash tables rather than iterating through the tree)
* All RPC functions and events can now take multiple params in both directions and require fewer bytes per message
* HTTPS support is no longer a 'feature' of the framework but can easily be achieved in your app (see Tour slide)
* SocketStream no longer auto-restarts when server code is changed. Use `nodemon` instead
* CoffeScript, Jade and Stylus are still our preferred languages for writing JS, HTML and CSS respectively, but are now out of the core and supported via optional wrapper modules. Easily write your own wrapper for other languages.
* Client-side code is now organized by modules, in exactly the same way as you do on the server
* `SS.client` calls no longer autocomplete in the browser console (improves app startup speed as a result)
* No more global `R` variable to access the current Redis connection. Please establish and use your own connection in `app.js` instead
* No more Users Online functionality in the core. This will be released as an optional module in the future
* No more HTTP API in the core. One of the major goals of SocketStream 0.4 will be to support multiple interfaces allowing Request Responders to receive incoming calls over the websocket, console (REPL) and HTTP layer