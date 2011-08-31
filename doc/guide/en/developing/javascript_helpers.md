### Javascript Helpers

SocketStream comes with a number of JavaScript prototype helper methods, created automatically when you make a new project. The concept is very similar to ActiveSupport in Rails.

The default helpers we ship with are also used server-side throughout SocketStream. Hence you can use them in client, shared and server code and expect the same result, no matter where the code executes.

Take a look at /lib/client/3.helpers.js to see the available helpers. If for some reason these conflict with a third-party library, or you simply don't want to use them, just delete this file and it won't come back.