# Loading Assets On Demand 

If you're writing a small app you can safely ignore this section, as it's always better to pack all client assets into one file and send everything through together in one go if possible.

But what if you're writing a large app, or an app with multiple distinct sections like iCloud.com?

SocketStream allows you to load code (and other assets in the future) into your app asynchronously on demand.


### Loading Code

Sadly it's not possible to directly `require()` modules which haven't been loaded as the blocking nature of the `require` function means the browser would freeze until the module has been retrieved from the server - not good.

However SocketStream allows you to load additional code modules from the server asynchronously using the built-in `ss.load.code()` command. Once all the code you've requested has been loaded, we execute a callback, allowing you to `require()` the new modules as normal without any fancy syntax.

To try this out, create a new directory of application modules in `/client/code`. For the sake of this example, let's call our new directory `/client/code/mail`. We'll also assume this directory has a module in it called `search.js`.

```javascript
// in any client-side module
ss.load.code('/mail', function(){
  
  // all modules in /client/code/mail have now been loaded into
  // the root namespace (/) and can be required in the normal way
  var search = require('/search');

});
```

Note: Regardless of the directory you load, the modules inside will always be loaded into the root (/) namespace by default. If you want to mount the new modules in a different namespace, just create one or more sub-directories in the folder you're loading.


### Automatic Caching

Modules are only ever retrieved from the server once. Subsequent requests for the same directory will be returned instantly without contacting the server.