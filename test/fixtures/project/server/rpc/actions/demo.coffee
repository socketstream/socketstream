# Server-side Code

# Example of pre-loading sessions into req.session using inbuilt middleware
# To use the 'example' custom middleware you'd append m.example.authenticated() to the array
exports.before = (m) ->
  [m.loadSession()]

# Define actions which can be called from the client using ss.rpc('demo.ACTIONNAME', param1, param2...)
exports.actions = (req, res, ss) ->

  sendMessage: (message) ->
    if message && message.length > 0            # Check for blank messages
      ss.publish.all('newMessage', message)     # Broadcast the message to everyone
      res(true)                                 # Confirm it was sent to the originating client
    else
      res(false)
