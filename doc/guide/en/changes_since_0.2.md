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


### Questions you may have

##### What's happened to the HTTP API?

It's not supported for now. Not because we don't want it (we still fully believe writing the API first is a great idea and a killer feature of SocketStream 0.2), but now we have multiple websocket responders, the decision of where and how to implement the HTTP API layer is little more complex. We will keep giving this some thought. Ideas welcome.


##### What's happened to the Users Online functionality?

It is no longer included in the core for a few reasons: 1) Not everyone needs it, 2) Our current implementation requires Redis to be running, 3) There are multiple ways to work out how many people are online and push/pull the result to the client. We have extracted the old functionality into a separate add-on module which will be released shortly.


##### How come calls to ss.rpc() don't autocomplete like calls to SS.server() in SocketStream 0.2?

This 'feature' has not been implemented yet and I'm not sure if it will be. It means more code complexity and a slight delay when your app loads as the browser has to build an API function tree. If people really miss this feature it could be brought back with an optional config param. Let me know.


##### How come X isn't implemented?

Please check TODO.md and let us know if you miss something from 0.2 that's not on the list.
