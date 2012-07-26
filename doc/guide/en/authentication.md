# Authentication

Users can be authenticated in two ways: over the websocket or over HTTP.

The first option is useful if you're authenticating against a backend database or other resource you control, the second if you're using a third-party service such as Facebook Connect.

Either way, the goal is the same: to update `req.session.userId` with the user's unique ID.


### Authenticating over websockets

This is the best choice if you're authenticating against an internal database or LDAP server, etc.

```javascript
// server/rpc/app.js
exports.actions = function(req, res, ss){

  // tell SocketStream to load session data
  req.use('session');

  return {
  	authenticate: function(username, password){
  		
      // lookup user in DB, LDAP, etc

      if (user) {
        req.session.setUserId(user.id);
        res(true);
      } else {
        res('Access denied!');
      }

  	},

    logout: function(){
      req.session.setUserId(null);
    }
  }
}

```

Note: You could just set `req.session.userId` manually, but calling the `req.session.setUserId()` function saves the session and notifies SocketStream to immediately start sending events for this user (sent using `ss.publish.user()`) over the current websocket connection.


### Authenticating using HTTP

Since the same session object is also available over HTTP you may easily authenticate a user by updating `req.session.userId` whilst processing a HTTP request.

Let's look at a very simple example by adding the following 'route' to `app.js`:

```javascript
// app.js
ss.http.router.on('/authenticateMe', function(req, res) {
  req.session.userId = 'john';
  req.session.save(function(err){
    res.serve('main');
  });
});
```

Next, add an RPC action which sends the contents of `req.session.userId` over the websocket:

```javascript
// server/rpc/app.js
exports.actions = function(req, res, ss){

  // tell SocketStream to load session data
  req.use('session');

  return {
    
    getCurrentUser: function(){
      res('The current user is ' + req.session.userId);
    }

  }
};
```

Now visit `http://localhost:3000/authenticateMe` then enter the following command in the browser's console:

    ss.rpc('app.getCurrentUser')
    
And you'll see the following output:

    The current user is john


### Using Everyauth for Facebook Connect, Twitter, Github etc

SocketStream integrates well with popular authentication libraries such as [Everyauth](https://github.com/bnoguchi/everyauth).

Tip: Don't be tempted to follow the docs on the Everyauth website too closely - they are mainly geared at multi-page apps and/or specific to Express.

Here's an example of a full app which authenticates against Twitter's OAuth service.

To get started, register your new app at https://dev.twitter.com/apps/new

When testing your app supply `http://127.0.0.1:3000` as the Callback URL. Change this to the real URL when your app goes into production.


```javascript
// app.js
var http = require('http')
  , ss = require('socketstream')
  , everyauth = require('everyauth');

ss.client.define('main', {
  view: 'app.jade',
  css:  ['libs', 'app.styl'],
  code: ['libs', 'modules', 'main']
});

ss.http.router.on('/', function(req, res) {
  res.serve('main');
});

everyauth.twitter
  .consumerKey('YOUR CONSUMER ID HERE')
  .consumerSecret('YOUR CONSUMER SECRET HERE')
  .findOrCreateUser( function (session, accessToken, accessTokenSecret, twitterUserMetadata) {
    var userName = twitterUserMetadata.screen_name;
    console.log('Twitter Username is', userName);
    session.userId = userName;
    session.save();
    return true;
  })
  .redirectPath('/');

ss.http.middleware.prepend(ss.http.connect.bodyParser());
ss.http.middleware.append(everyauth.middleware());

var server = http.Server(ss.http.middleware);
server.listen(3000);

ss.start(server);

// To authenticate visit http://local.host:3000/auth/twitter
```

Many more details on this and other examples coming soon.