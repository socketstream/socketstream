### Users and Modular Authentication

As almost all web applications have users which need to sign in and out, we have built the concept of a 'current user' into the core of SocketStream. This not only makes life easier for developers, but is vital to the correct functioning of the pub/sub system, authenticating API requests, and tracking which users are currently online (see section below).

Authentication is completely modular and trivial for developers to implement. Here's an example of a custom authentication module we've placed in /lib/server/custom_auth.coffee

``` coffee-script
exports.authenticate = (params, cb) ->
  success = # do DB/third-party lookup
  if success
    cb({success: true, user_id: 21323, info: {username: 'joebloggs'}})
  else
    cb({success: false, info: {num_retries: 2}})
```

* Notice the first argument takes incoming params from the client, normally in the form of `{username: 'something', password: 'secret'}` but it could also contain a biometric ID, iPhone device ID, SSO token, etc.

* The second argument is the callback. This must return an object with a 'status' attribute (boolean) and a 'user_id' attribute (number or string) if successful. Additional info, such as number of tries remaining etc, can optionally be passed back within the object and pushed upstream to the client if desired.

To use this custom authentication module within your app, you'll need to call `@session.authenticate` in your /app/server code, passing the name of the module you've just created as the first argument:

``` coffee-script
exports.actions =

  authenticate: (params, cb) ->
    @session.authenticate 'custom_auth', params, (response) =>
      @session.setUserId(response.user_id) if response.success       # sets session.user.id and initiates pub/sub
      cb(response)                                                  # sends additional info back to the client

  logout: (cb) ->
    @session.user.logout(cb)                                        # disconnects pub/sub and returns a new Session object
```

This modular approach allows you to offer your users multiple ways to authenticate. In the near future we will also support common authentication services like Facebook Connect which require interaction with the HTTP layer.

Once a user has been authenticated, their User ID is accessible by calling `@session.user_id` anywhere in your /app/server code.
