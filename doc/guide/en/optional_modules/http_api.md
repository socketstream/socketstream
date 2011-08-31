### HTTP API

_Module status: Enabled by default. Disable with `SS.config.api.enabled = false`_

The HTTP API allows all server-side actions to be accessed over a traditional, high-speed, HTTP or HTTPS request-based interface.

For example a method invoked as `SS.server.chat.members.onlineNow()` over the websocket can also be accessed as `http://localhost:3000/api/chat/members/onlineNow` via the HTTP API.


#### Passing values

You can pass values to your server-side methods as part of the query string:

``` coffee-script
# http://localhost:3000/api/app/square.json?5 will call
square(5) # in /app/server/app.coffee
```

You may also pass multiple values at once by separating each one with `&`, but note these are passed as an object to the first argument of your method.

Hence if the HTTP API is something you wish to use, you should always ensure your methods expect multiple values to be passed to the first argument as an object (as was the case in SocketStream 0.1):

``` coffee-script
# http://localhost:3000/api/app/updateCart.json?total=126.23&items=5 will call
updateCart({total: 126.23, items: 5}) # in /app/server/app.coffee
```

#### HTTP POST data

On rare occasions you may wish to POST data to a method via the HTTP API. If you do, you may access it with `@request.post.raw` from within the server-side method. Note : Posting data does not affect the way a method is called or the arguments it receives in anyway.


#### Authentication

The HTTP API will support various forms of authentication in future versions of SocketStream.


#### Config Options

By default the HTTP API answers all requests to `/api`, but this URL prefix can be changed with the `SS.config.api.prefix` config parameter if you prefer.

You may also set `SS.config.api.https_only = true` if you have HTTPS enabled and want to ensure API requests are only served over SSL.
