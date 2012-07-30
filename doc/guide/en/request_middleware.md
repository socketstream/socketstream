# Request Middleware

Request Middleware allows you to inspect, transform, redirect or drop incoming requests over the websocket, HTTP API, or REPL (using ss-console).

If you've used Connect HTTP middleware before the concept and API will be instantly familiar. Essentially incoming requests can be processed through a chain of middleware BEFORE they arrive at their final destination - typically the RPC command you are requesting.

Middleware can be provided internally, via external modules, or custom-defined in your app.

Regardless, all middleware is invoked using the `req.use()` command from within your `server/rpc` code.


### Internal Middleware

Right now SocketStream provides two simple internal middleware functions: `debug` and `session`. 

#### debug

The `debug` middleware will output the contents of the `req` object to the terminal, useful when you're debugging problems. It takes an optional argument indicating which color to output the message in:

```javascript
// server/rpc/app.js
exports.actions = function(req, res, ss){
  
  // output all incoming requests to the console in cyan
  req.use('debug', 'cyan');

  return {
    square: function(n){
      res(n * n);
    }
  }
}
```

#### session

The `session` middleware instructs SocketStream to retrieve the user's session from the session store BEFORE executing the next action:

```javascript
// server/rpc/app.js
exports.actions = function(req, res, ss){

  // load user's session into req.session  
  req.use('session');

  return {
    square: function(n){
      res(n * n);
    }
  }
}
```

Try adding `req.use('debug')` after `req.use('session')` to see how the session data has been loaded into `req.session`. Remember, the order you call middleware in is very important.


### Using third-party middleware

Simply pass the module/function directly. E.g:

    req.use(require('text-utils').sanitize, {anyConfig: 'can be passed here'});



### Creating your own Middleware

Creating custom middleware in your application is easy.

Let's start by creating an RPC action which multiplies incoming numbers (the first param).

```javascript
// server/rpc/app.js
exports.actions = function(req, res, ss){

  // pass the multiplier to the second arg
  req.use(multiplyNumber, 2);

  return {
    showResult: function(n){
      res('The incoming number is ' + n);
    }
  }
}

// define my custom middleware function
multiplyNumber = function(multiplier){
  
  return function(req, res, next){
    var = num = req.params[0];
    if (num && typeof(num) == 'number')
      req.params[0] = (num * multiplier);
    next() // indicates middleware is finished processing
  }

}
```

Let's test this out in the browser:

    ss.rpc('app.showResult', 80)   // outputs "The incoming number is 160" to the console


#### Using Middleware for Authorization

Request Middleware is the perfect way to check if a user is authorized before proceeding further:

```javascript
// server/rpc/app.js
exports.actions = function(req, res, ss){

  // check user is logged in before proceeding
  req.use(checkAuthenticated);

  return {
    topSecret: function(){
      // this function will only be called if user is logged in
      res(bankCodes);
    }
  }
}

// define custom middleware to ensure user is logged in
checkAuthenticated = function(){
  
  return function(req, res, next){
    if (req.session && req.session.userId) return next();
    res('Access denied'); // prevent request from continuing
  }

}
```

You could take this one step further and load the user's data from a database and attach it to `req.user`.


### Sharing middleware across multiple files

Once you've created your custom middleware you'll probably want to use it across multiple files. SocketStream makes this easy by allowing middleware to be placed in `server/middleware` and loaded into an API Tree.

For example let's move the `checkAuthenticated` function above to its new home in `server/middleware/admin/user.js`:

```javascript
// server/middleware/admin/user.js
exports.checkAuthenticated = function(){
  
  return function(req, res, next){
    if (req.session && req.session.userId) return next();
    res(false); // Access denied: prevent request from continuing
  }

}
```

You can now call this function from any `server/rpc` file with:

    req.use('session');
    req.use('admin.user.checkAuthenticated');

Note: `req.use('session')` must be called first as the `checkAuthenticated` middleware uses the `req.session` object.

Although you strictly don't have to, we highly recommend creating at least one folder in `server/middleware` to store your custom middleware to prevent any future namespace conflicts.


### Food for thought

Request Middleware allows for many exciting new opportunities around models and scaling.

For example you could write your own middleware which handles CRUD requests (create, update, delete, etc) and forwards them directly to MongoDB, or use [Hook.IO](https://github.com/hookio/hook.io) to forward incoming requests to a different system altogether. 

Bear in mind there's no need to define any RPC actions at all if your middleware can respond to all incoming requests.

We'll be exploring all these ideas in the future when time permits, but you don't have to wait for us. Start experimenting today and publish your middleware module on npm for everyone to use.
