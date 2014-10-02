@ngdoc overview
@name Sessions

@description
# Sessions

SocketStream uses the Connect Session Store to ensure sessions can be easily shared between HTTP and Websocket requests using a similar API.

This means you're able to write data to a session from SocketStream and then use it in Express.js or any other page-based framework which uses Connect - especially useful when performing authentication.


### Using Sessions over Websockets

For optimum speed and flexibility, session data is not retrieved by default when a websocket request is processed by the server. Before you do anything with sessions, you'll need to activate the internal `session` [Request Middleware](#/tutorials/request_middleware) as shown below:

<pre>
// server/rpc/app.js
exports.actions = function(req, res, ss) {

  // Load session data into req.session
  req.use('session');

  return {
    testAction: function(){
      console.log('This request now has session data:', req.session);
    }
  }
}
</pre>

#### Getting/Setting Custom Session Data

<pre>
// server/rpc/app.js
exports.actions = function(req, res, ss) {

  // Load session data into req.session
  req.use('session');

  return {
    getSession: function() {
      console.log('The contents of my session is', req.session);
    },
    updateSession: function(){
      req.session.myVar = 1234;
      req.session.cart = {items: 3, checkout: false};
      req.session.save(function(err){
        console.log('Session data has been saved:', req.session);
      });
    }
  }
}
</pre>

### Using Sessions over HTTP

The same session data is automatically loaded into `req.session` when accessed over HTTP. For example, append this route to your `app.js` file:

<pre>
// app.js
ss.http.router.on('/updateSession', function(req, res) {
  req.session.myVar = 4321;
  res.end('req.session.myVar has been updated to', req.session.myVar);
});
</pre>

Note: There is no need to call `req.session.save()` if you're calling `res.end()`.


### Session Stores

The in-memory Connect Session Store is used by default to allow you to start developing easily. Before your app goes into production you **must** use a Connect Session Store with a persistent backend to avoid memory leaks.

We have bundled the `connect-redis` store as standard as this makes an excellent choice. To use it, add the following line to your `app.js` file:
<pre>
    // in app.js
    ss.session.store.use('redis');
</pre>

Any Redis configuration can be passed to the second argument (e.g `{port: 1234}`).


### Auto-expiring Sessions

By default sessions will expire within 30 days, unless the session is terminated beforehand (e.g. the user closes the browser). To set a different expiry time put the following in your `app.js` file:
<pre>
    // in app.js
    ss.session.options.maxAge = 8640000;  // one day in milliseconds
</pre>

### Setting a Secret
By default the cookie parser will use `'SocketStream'` as its secret. You
*should* set your own secret in production:

<pre>
    // in app.js
    ss.session.options.secret = crypto.randomBytes(32).toString();
</pre>
