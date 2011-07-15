# Client-side Code

# Bind to socket events
SS.socket.on 'disconnect', ->  $('#message').text('SocketStream server is down :-(')
SS.socket.on 'reconnect', ->   $('#message').text('SocketStream server is up :-)')

# This method is called automatically when the websocket connection is established. Do not rename/delete
exports.init = ->

  # Make a call to the server to retrieve a message
  SS.server.app.init (response) ->
    $('#message').text(response)


  ### START QUICK CHAT DEMO ####

  # Listen for new messages and append them to the screen
  SS.events.on 'newMessage', (message) ->
    $("<p>#{message}</p>").hide().appendTo('#chatlog').slideDown()
  
  # Show the chat form and bind to the submit action
  # Note how we're passing the message to the server-side method as the first argument
  # If you wish to pass multiple variable use an object - e.g. {message: 'hi!', nickname: 'socket'}
  $('#demo').show().submit ->
    message = $('#myMessage').val()
    if message.length > 0
      SS.server.app.sendMessage message, (success) ->
        if success then $('#myMessage').val('') else alert('Unable to send message')
    else
      alert('Oops! You must type a message first')

  ### END QUICK CHAT DEMO ####