TODO
====

Still to do before 0.2.0 is released.

* Auto-detect new files (elisee is looking into this using the 'stalker' lib)
* Make sure all external links (to technologies we mention) and internal links (between pages/files) are in place within all markdown documentation
* Index /doc/guide sections within Readme
* Can we fix weird new line breaks in multi-process mode?

To complete during 0.2.X releases

* Investigate Connect Auth and Everyauth. Choose which one to integrate, bearing in mind Models coming in 0.3
* Re-implement Basic Auth using chosen Auth framework and document use with Facebook Connect etc
* Write more tests for errors which can be displayed in the browser's console over websockets
* Test SocketStream with Node 0.5/0.6 once Connect 2.0 is ready. Apart from that we should be able to support it fully in single process mode at least
* Can we add gzip compression to static assets?

Pushed back to 0.3

* Make 'socketstream frontend' utalize multiple cores - most likely using Node 0.5 child_process.fork()
* Refactor coffee compile so we don't repeat ourselves (part of a Client Asset Manager rewrite)
* Can we detect and handle idle clients better on the browser. Would be good if it could emit an event after a period of inactivity we can then emit server-side.
