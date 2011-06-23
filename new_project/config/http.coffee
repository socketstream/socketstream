# HTTP Router Config
# ------------------

# Version 1.0

# This file defines how incoming HTTP requests are handled
# Note: The default configuration will probably change a lot in the future. Be warned!

exports.call = (request, response, next) ->

    # Custom Middleware
    # -----------------
   
    # Hook-in your own custom HTTP middleware to modify or respond to requests before they're passed to the SocketStream HTTP stack
    # See README for more details and example middleware code
   
    # require('my_middleware').call request, response, next
 

    # Unless you're passing the callback to custom middleware, you'll need to call next() here 
    next()
   
