# HTTP Middleware Config
# ----------------------

# Version 2.0

# This file defines how incoming HTTP requests are handled

# CUSTOM MIDDLEWARE

# Hook-in your own custom HTTP middleware to modify or respond to requests before they're passed to the SocketStream HTTP stack

custom = ->

  (request, response, next) ->
    # console.log 'This is my custom middleware. The URL requested is', request.url
    # Unless you're serving a response you'll need to call next() here 
    next()
   

# CONNECT MIDDLEWARE

# connect = require('connect')

# Stack for Primary Server
exports.primary =
  [
    #connect.logger()            # example of calling in-built connect middleware. be sure to install connect in THIS project and uncomment out the line above
    #require('connect-i18n')()   # example of using 3rd-party middleware from https://github.com/senchalabs/connect/wiki
    #custom                      # example of using your own custom middleware (using the example above)
  ]

# Stack for Secondary Server
exports.secondary = []