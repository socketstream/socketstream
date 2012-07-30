# Testing your app

Note: This feature is brand new and still in the 'experimental' stage. Please help us by reporting any problems so we can perfect server-side testing in future releases.

SocketStream allows you to test your app using Node's `assert` module, or any test framework of your choice. We recommend using [Mocha](http://visionmedia.github.com/mocha) with [should.js](https://github.com/visionmedia/should.js). This is the combination used in the example below.


### Getting Started

First install `mocha` and `should.js`:

    [sudo] npm install -g mocha
    [sudo] npm install -g should

Create a directory for your tests:

    mkdir test

For this example we're going to test the `ss.rpc('app.square')` function shown below:

```javascript
// in/server/rpc/app.js
exports.actions = function(req, res, ss) {

  return {

    square: function(number) {
      res(number * number);
    }

  }
}
```

Create a new test file in the `/test` directory:

```javascript
// in /test/app.js
var ss = require('socketstream').start();

describe('app.square', function(){

  it('should square a number', function(done){
    
    ss.rpc('app.square', 4, function(params){
      params.toString().should.equal('16');
      done();
    });

  });

});
```

Run all your tests in `/test` with:

    mocha -r should

And you'll see the following output:

    ✔ 1 test complete (1ms)


Note: If you're using any CoffeeScript in your app, start `mocha` with:

    mocha -r should -r coffee-script


A few things to note about RPC tests:

* All `ss.rpc()` commands return an array of params (e.g. `[16]` in the example above). As two `array`s cannot be directly compared in Javascript, it is necessary to convert the response to a `string` before calling `should.equal()`
* Create as many test files as you like. Subsequent calls to `var ss = require('socketstream').start();` will return the same server instance from memory

* Tip: Rather than typing `mocha -r should` each time, add the following lines to `package.json` so you can run your tests with `npm test`:

    "scripts": {
      "test": "mocha -r should"
     }



### Sessions

A new Session (with a unique ID) is automatically created for you the first time you `start()` SocketStream. This allows you to test `ss.rpc()` commands which use `req.session.userId`.


### What can I test?

Right now you can only test `ss.rpc()` commands. A major goal of SocketStream 0.4 is to allow any Request Responders to be tested in a similar way.

We are also considering implementing a mock Publish Transport, to allow you to test `ss.publish()` commands.

