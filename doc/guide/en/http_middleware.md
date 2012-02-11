# HTTP Middleware

#### Warning: Incomplete. More to follow

SocketStream provides a stack of Connect HTTP middleware which is used internally to serve single-page clients, asset files and static files (e.g. images) in `client/static`.

The Connect `app` instance is accessible directly via the `ss.http.middleware` variable within `app.js`.

SocketStream allows you to prepend new middleware to the top of the stack (to be processed BEFORE SocketStream middleware) using:

    ss.http.middleware.prepend()

For example you could add:

    ss.http.middleware.prepend( ss.http.connect.bodyParser() );

Because SocketStream adds `connect.cookieParser()` and `connect.session()` to the stack, if the middleware you're wanting to use requires sessions support (i.e. access to `req.session`) it will need to be appended to the bottom of the stack AFTER SocketStream middleware has been loaded as so:

    ss.http.middleware.append( everyauth.middleware() );

Apart from determining where the middleware should be added, the `prepend()` and `append()` functions work in exactly the same way as `connect.use()`.