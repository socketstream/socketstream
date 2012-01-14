### QUICK CHAT DEMO ####

# Delete this file once you've seen how the demo works

# Listen for incoming messages and append them to the screen
ss.event.on 'newMessage', (message) ->
  $("<p>#{message}</p>").hide().appendTo('#chatlog').slideDown()

# Example of using a module
message = require('message')

# Wait for connection to the server
SocketStream.event.on 'ready', ->
  
  # Show the chat form and bind to the submit action
  $('#demo').on 'submit', ->

    # Grab the message from the text box
    text = $('#myMessage').val()

    # Use the module to ensure it's valid before sending to the server
    message.send text, (success) ->
      if success
        $('#myMessage').val('') # clear text box
      else
        alert('Oops! Unable to send message')
