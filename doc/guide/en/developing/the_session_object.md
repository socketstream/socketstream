### The @session object

SocketStream creates a new session when a browser connects to the server for the first time, storing a session cookie on the client and the details in Redis. When the same visitor returns (or refreshes the browser), the session is instantly retrieved.

The user's session details can be accessed using the @session object from within your server-side code. E.g.

``` coffee-script
exports.actions =

  getInfo: (cb) ->
    cb "This session was created at #{@session.created_at}"
```

Note: If you wish to access the @session attribute within another callback, make sure your callbacks use => instead of ->


#### Storing custom data within a session

You may also store custom data inside the session.attributes object like so:

``` coffee-script
exports.actions =

  set: (size, cb) ->
    if size.length < 100
      @session.attributes = {size: size, type: 't-shirt'}
      @session.save cb
    else
      cb false
  
  getSize: (cb) ->
    cb @session.attributes.size

```

Important: You may use @session.attributes to store any data that can go through JSON.stringify(), but keep the amount of data small as it will be sent from front end to back end servers on every request. Remember to sanity check incoming data before calling session.save().


#### Where is session data stored?

All session data is stored in Redis. It is also cached on the front end server the user is currently connected to and sent alongside every internal RPC request to the back end server to avoid hitting Redis for every request.