### Custom HTTP handlers / middleware

SocketStream uses Connect both internally and externally, allowing you to hook-in any 3rd-party middleware - or easily write your own!

Middleware can either alter the request object or, more usefully, allow you to respond with your own headers and content depending upon the URL, user agent and other request parameters sent.

This is a very powerful feature, particularly because it's the first thing Node calls when a HTTP request comes in - so you have all the flexibility and speed of a bare-bones Node.js app.

Please see the comments in /config/http.coffee to make use of custom/3rd-party Connect middleware.
