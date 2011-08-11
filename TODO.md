TODO
====


Still to do before 0.2.0 is released. 

* Write tests for all errors which can be displayed in the browser's console over websockets
* Find a way to do session.load() when using empty session objects in /config/events.coffee
* Tidy up way channel and user subscriptions are persisted between sessions (and cleanup things when clients depart)
* Fix Basic Auth on HTTP API (or ideally re-implement using Connect Auth)
* Continue to refactor Session to load the bare minimum needed per-request
* Write more tests for sending to multiple channels and users at once
* Make new server-side events: 'channel:subscribe', 'channel:unsubscribe' work correctly
* Can we bring back the "loaded 0 server files..." message even though these files are now loaded in another process?
* Fully implement, test and document session.attributes. It's been there since the start but about time we make it official.
* We should only fire 'client:reload' events once the server child_process has fully reloaded or the libs re-compiled
* Switch to using the newer 'zmq' package once this issue has been fixed: https://github.com/JustinTulloss/zeromq.node/issues/41

Plus the following, which I would appreciate any help with :)

* Fix incredibly annoying nested error bug in Session class when calling a method without a session.user_id when exports.authenticates = true over websockets (it's something to do with going through the Redis hgetall callback)
* Get 0.2 working with Node 0.5 (ZeroMQ bindings seg fault currently). Not had chance to investigate why yet. Also Connect 2.0 is not ready
* Document and test SocketStream with Connect Auth. Would be good to show Facebook and Twitter examples in Readme
* Auto-detect new files (elisee is looking into this using the 'stalker' lib)
* Can we make it work with the Node debugger and https://github.com/dannycoates/node-inspector ? (bear in mind we now have multiple processes)
* Make sure all external links (to technologies we mention) and internal links (between pages/files) are in place within all markdown documentation
* Can we detect and handle idle clients better on the browser. Would be good if it could emit an event after a period of inactivity we can then emit server-side.
* Can we add gzip compression to static assets?


Pushed back to 0.3

* Make 'socketstream frontend' utalize multiple cores - most likely using Node 0.5 child_process.fork()
* Refactor coffee compile so we don't repeat ourselves (part of a Client Asset Manager rewrite)
* SS.server methods should support multiple arguments - implemented in a way consistent with the HTTP API (will maybe do this before 0.3)
