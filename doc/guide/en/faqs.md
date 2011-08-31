### FAQs

__Q: Will SocketStream support Java/Erlang/PHP/Ruby/Python/my favourite language?__

A: Not directly. SocketStream is a stand-alone framework which uses a very carefully curated technology stack. However, rather than re-write your entire app in SocketStream, consider using it as a front-end to a legacy application. If your legacy appication has a web service this should be easy. If not, consider adding ZeroMQ bindings to it and connecting to it at high speed using Plug Sockets.


__Q: Can I integrate SocketStream into my existing web app?__

A: No. At least not on the same host and port. For 'hybrid' real time apps we recommend using [Pusher](http://www.pusher.com)


__Q: Can I host more than one SocketStream website on the same port?__

A: Not at the moment. We will be looking at ways to support this in the future using reverse proxies.


__Q: How do I test my app?__

A: For now we recommend choosing one of the many testing frameworks available for Node.js. Let us know if there is anything we can do to help integrate SocketStream with your framework of choice. SocketStream will have an in-built default testing framework in the future but it will be a radical departure from anything that's gone before. Look out for announcements towards the end of 2011.


__Q: Can I deploy SocketStream apps to Heroku?__

A: Not at the moment as Heroku cannot correctly route websockets, but we working on something big in this area. Stay tuned.


__Q: How do I make models?__

A: There is no ability to create server-side models at the moment. This won't stop you from making many types of apps such as real-time chat, but may prove annoying if your app involves lots of CRUD. The good news is we have a great solution called Real Time Models which will be available in version 0.3.


__Q: Does SocketStream work with Backbone.js__

A: Not yet, but it's coming in version 0.3. There are already community efforts underway to make it work right now. Please take a look at our Google Group for the latest developments.


__Q: Will the API / directory structure / config file format change in the future?__

A: Yes. SocketStream is not just a new web framework, it's at the forefront of an entirely new way to develop web applications, so expect a lot of rapid change over the next 12 months as we explore new ideas. Things should settle down a little after 1.0.0 is released. Until then we will do everything we can to keep developers involved and up-to-date with any major changes. We will also provide automatic upgrade scripts where possible. The best thing to do is keep checking the HISTORY file and be sure to quote the SocketStream version number next to any examples you post online.


__Q: Will SocketStream have a public website?__

A: Sure! We're working on www.socketstream.org right now :)


__Q: Will websockets work in Opera?__

A: As of this writing websockets is supported but turned off by default in Opera. In order for Opera 11 to run websockets apps you need to turn it on in the settings. Do "opera:config#Enable%20WebSockets" in the address field and hit enter. Check "Enable websockets" Save and you are good to go.