# RPC Server-side Websocket Responder

The RPC Responder allows you to call functions on the server from the browser over the websocket, returning a response if requested. It is powerful when used in conjunction with [Request Middleware](https://github.com/socketstream/socketstream/blob/master/doc/guide/en/request_middleware.md).

To make a Remote Procedure Call from the browser use the `ss.rpc()` function.

Let's assume we want to return an array of the latest products in an online store. We would want to call the following command from the browser:

``` javascript
ss.rpc('products.latest', function(result){ console.log('The latest products are:', result); })
```

This command will be sent over the websocket and sent directly to the RPC Responder. But how will it know which function to call on the server?

The RPC responder loads all commands in `server/rpc` into an API Tree. Thus the command to call 'products.latest' will be matched to the 'latest' function in the 'products' file `/server/rpc/products.js`.

The `products.js` file should contain the available actions as so:

``` javascript
// server/rpc/products.js
exports.actions = function(req, res, ss) {

  return {

    latest: function(){
      res(['iPhone 4S', 'Dell LCD TV', 'HP Printer']);
    }

  }
};
```

### Sending Arguments

The RPC Responder can take and return unlimited arguments intuitively. For example let's write another action on the server:

``` javascript
// server/rpc/products.js
exports.actions = function(req, res, ss) {

  return {

    topSelling: function(startDate, endDate, productType){
      // do calculations then send multiple args back to client...
      res(['iPad', 'iPhone', ...], 'Scooby Doo');
    },

    latest: function(){
      res(['iPhone', 'Dell LCD TV', 'HP Printer']);
    }

  }
};
```

To call this from the browser we'd use:

``` javascript
// client/code/main/products.js
var productType = 'electronics';
ss.rpc('products.topSelling', '2012-01-01', '2012-01-31', productType, function(products, bestSalesperson) {
  console.log('The top selling products in ' + productType + ' were:', products);
  console.log('And the best salesperson was:', bestSalesperson);
});
```

The ability to pass multiple arguments also means you can choose to follow the 'error first' idiom typically used in Node:

``` javascript
// client/code/main/products.js
ss.rpc('products.add', 123, function(err, data) {
  if (err) {
    return alert("Error adding product!");
  }
  $('#products').append( ss.tmpl['product.details'].render(data) );
});
```

You may pass as many arguments as you want - just remember the last argument should always be the callback if you're expecting a response from the server.


### How can I call a Mongoose/Redis/DB/REST API from my RPC actions?

Require the module you need in your main `/app.js` file then add it to the 'internal API':

```javascript
// in /app.js

var db = require('mydb');
var conn = db.createConnection();

ss.api.add('db', conn);
```

You may now access this DB connection in your `/server/rpc` methods with `ss.db`.


### How does it work under the hood?

The RPC Responder serializes messages in both directions using JSON. Thus the actual message sent over the wire is a string which looks like this:

    {id: 1, m: 'method.to.call', p: [param1, param2, ...]}


### How can I call an RPC action from a server-side file?

RPC actions are strictly called via the client-side.

If you have business logic that you'd like to share between both the client and server sides, we recommend you create a new `node_module` as so:

```javascript
// in /node_modules/myModule/myModule.js

myModule = function() {

  sharedFunction: function() {
    return "shared function called";
  }

};

exports.myModule = myModule();
```

```javascript
// in /app.js

myModule = require('myModule').myModule();

myModule.sharedFunction(); // returns "shared function called"
```

```javascript
// in /rpc/demo.js

myModule = require('myModule').myModule();

exports.actions = function(req, res, ss) {

    callSharedFunction: function() {
        myModule.sharedFunction(); // returns "shared function called"
    }

};
```
