### Sharing Code

One of the great advantages SocketStream provides is the ability to share the same JavaScript/CoffeeScript code between client and server. Of course you can always copy and paste code between files, but we provide a more elegant solution:

Shared code is written and namespaced in exactly the same way as Client code, but it is designed to run in both environments. Simply add a new file within /app/shared and export the functions, properties, objects or even CoffeeScript classes you wish to share.

For example, let's create a file called /app/shared/calculate.coffee and paste the following in it:

``` coffee-script
exports.circumference = (radius = 1) ->
  2 * estimatePi() * radius

estimatePi = -> 355/113
```    

This can now be executed by calling `SS.shared.calculate.circumference(20)` from anywhere within your server OR client code! This makes /app/shared the ideal place to write calculations, formatting helpers and model validations - among other things. Just remember never to reference the DOM, any back-end DBs or Node.js libraries as this code needs to remain 'pure' enough to run on both the server or browser.

All Shared code is pre-loaded and added to the `SS.shared` API tree which may be inspected at any time from the server or browser's console. You'll notice `estimatePi()` does not appear in the API tree as this is a private function (although the code is still transmitted to the client).

**Warning** All code within /app/shared will be compressed and transmitted to the client upon initial connection. So make sure you don't include any proprietary secret sauce or use any database/filesystem calls.
