# Server-side Code

exports.actions =
  
  init: (cb) ->
    cb "SocketStream version #{SS.version} is up and running. This message was sent over Socket.IO so everything is working OK."

  # Quick Chat Demo
  sendMessage: (message, cb) ->
    if message.length > 0                             # Check for blank messages
      SS.publish.broadcast 'newMessage', message      # Broadcast the message to everyone
      cb true                                         # Confirm it was sent to the originating client
    else
      cb false
