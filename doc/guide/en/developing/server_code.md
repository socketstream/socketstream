### Server-side Code

All files places within /app/server can __optionally__ choose to export actions to the `SS.server` public API, accessible via websockets and the HTTP API (if enabled). All public actions __must__ take a callback as their last argument:


``` coffee-script
exports.actions =

  whatAmI: (cb) ->
    cb "A public action. I must take a callback"


whatAmI: ->
  return "A private method. I don't have to take callbacks"
```

#### Sending multiple arguments

As of SocketStream 0.2.0, you may now send multiple arguments to /app/server methods; however, note this currently breaks 100% compatibility with the HTTP API. If you wish to keep this please send multiple values through as an object to the first argument (see HTTP API docs for example).

#### Sharing private code between files

Sometimes you'll want to share private code between /app/server files. We recommend placing these modules in /lib/server and referencing them in your code as so:

``` coffee-script
my_module = require(SS.root + '/lib/server/my_module.coffee')
```

As that's quite a mouthful we provide a helpful wrapper around `require` to cut down the typing:

``` coffee-script
my_module = SS.require('my_module.coffee')
```
