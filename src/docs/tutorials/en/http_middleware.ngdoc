@ngdoc overview
@name HTTP Middleware

@description
# HTTP Middleware

SocketStream provides a stack of Connect HTTP middleware which is used internally to serve single-page clients, asset files and static files (e.g. images) in `client/static`.

The Connect `app` instance is accessible directly via the `ss.http.middleware` variable within `app.js`. The stack is loaded in this order:


Connect middleware order
---

Any prepended middleware is loaded here, then we load:

- compress
- cookieParser
- favicon
- session

Any appended middleware is loaded here, then we load:

- eventMiddleware (handles loading client files when running in development mode)
- static
- staticCache (optional)

Prepending custom middleware
---

SocketStream allows you to prepend new middleware to the top of the stack (to be processed BEFORE SocketStream middleware) using:
<pre>
    ss.http.middleware.prepend()
</pre>
For example you could add:
<pre>
    ss.http.middleware.prepend( require('connect-winston')(winston) );
</pre>
Appending custom middleware
---

Because SocketStream adds `connect.cookieParser()` and `connect.session()` to the stack, if the middleware you're wanting to use requires sessions support (i.e. access to `req.session`) it will need to be appended to the bottom of the stack AFTER SocketStream middleware has been loaded as so:
<pre>
    ss.http.middleware.append( everyauth.middleware() );
</pre>
Apart from determining where the middleware should be added, the `prepend()` and `append()` functions work in exactly the same way as `connect.use()`.

Loading staticCache middleware
---

In order to avoid making repeated fs.readFile requests for serving static files, you can load Connect's 'connect-static' middleware, by passing this:
<pre>
    ss.http.set({
      staticCache: {
        maxObjects: 128,      // The number of objects to store in cache
        maxLength: 1024 * 256 // The file size limit for storing a file in cache, 256Kb
      }
    });
</pre>

Passing custom HTTP middleware settings
---

You can pass custom http middleware settings via <code>ss.http.set</code>:
<pre>
    ss.http.set({
      static: {
        maxAge: 30 * 24 * 60 * 60 * 1000 // cache static assets in the browser for 30 days
      },
      staticCache: {
        maxObjects: 128,       // The number of objects to store in cache
        maxLength: 1024 * 256 // The file size limit for storing a file in cache, 256Kb
      }
    });
</pre>

At the moment, you can use this to set custom options for the following SS middleware:

- static
- staticCache
- session (secure flag only)
- strategy

We will find a way to make all of the middleware customisable in the near future.

Changing the HTTP middleware approach
---

Short of setting up your own middleware stack, you can pick a strategy other than the default.
The minimal strategy will leave out session and compress middleware. So you will have to manage
that yourself.

<pre>
    ss.http.set({
        strategy: 'minimal'
    });
</pre>

Setting a custom HTTP middleware strategy
---

As an experimental feature you can set your own strategy. You can base it on the default strategy
found in <a href="https://github.com/socketstream/socketstream/tree/master/lib/http">the source</a>.

It can be configured by

<pre>
    ss.http.set({
        strategy: require('./my.own.strategy')
    });
</pre>

