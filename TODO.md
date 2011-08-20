TODO
====

Still to do before 0.2.0 is released.

* -- All below are Session related --
* Do we get new channel:subscribe server side events when session is reestablished?
* Make new server-side events: 'channel:subscribe', 'channel:unsubscribe' work correctly

* Write more tests for errors which can be displayed in the browser's console over websockets
* Fix Basic Auth on HTTP API (or ideally re-implement using Connect/Every Auth)
* Can we bring back the "loaded 0 server files..." message even though these files are now loaded in another process?
* Switch to using the newer 'zmq' package once this issue has been fixed: https://github.com/JustinTulloss/zeromq.node/issues/41

Plus the following, which I would appreciate any help with :)

* Get 0.2 working with Node 0.5 (ZeroMQ bindings seg fault currently). Not had chance to investigate why yet. Also Connect 2.0 is not ready
* Document and test SocketStream with Connect Auth. Would be good to show Facebook and Twitter examples in Readme
* Auto-detect new files (elisee is looking into this using the 'stalker' lib)
* Can we make it work with the Node debugger and https://github.com/dannycoates/node-inspector ? (bear in mind we now have multiple processes)
* Make sure all external links (to technologies we mention) and internal links (between pages/files) are in place within all markdown documentation
* Can we detect and handle idle clients better on the browser. Would be good if it could emit an event after a period of inactivity we can then emit server-side.
* Can we add gzip compression to static assets?
* Find out why the console.log output leaves double line spaces


Pushed back to 0.3

* Make 'socketstream frontend' utalize multiple cores - most likely using Node 0.5 child_process.fork()
* Refactor coffee compile so we don't repeat ourselves (part of a Client Asset Manager rewrite)
* SS.server methods should support multiple arguments - implemented in a way consistent with the HTTP API (will maybe do this before 0.3)
