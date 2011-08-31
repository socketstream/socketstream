### The @request object

SocketStream 0.2 introduces the @request object which contains all the meta data associated with calls to /app/server methods. While the data coming in via the main params will always remain the same regardless if the call was made via the websocket or HTTP API, the contents of the @request object will vary depending upon the way the method was called and the data associated with it.

For example, if you called the /app/server method via the websocket the @request object will look something like this:

    {
      id: 45,
      origin: 'socketio'
    }

But if you called exactly the same method over the HTTP API and inspected the @request object it would look this this:

    {
      id: 46,
      origin: 'httpapi'
    }

Also new in 0.2 is the ability to POST data to HTTP API methods. This is accessible from within the /app/server action via the @request method. E.g.

``` coffee-script
exports.actions =

  getPostData: (cb) ->
    if @request.post
      cb "The following data was posted: #{@request.post.raw}"
    else
      cb "No data was posted"
```