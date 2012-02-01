### QUICK CHAT DEMO ####

# Delete this file once you've seen how the demo works
# Note the final version of SocketStream 0.3 will create a 'bare-bones' new project by default
# This tutorial/demo and our recommended tech stack will be installed with the 'socketstream new -r' option


# Example of using a module
message = require('message')


# Listen for incoming messages and append them to the screen
ss.event.on 'newMessage', (message) ->

  # Example of using the Hogan Template in client/templates/chat/message.jade to generate HTML for each message
  html = HT['chat-message'].render({message: message, time: -> timestamp() })

  # Append it to the #chatlog div and show effect
  $(html).hide().appendTo('#chatlog').slideDown()


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


# Private functions

timestamp = ->
  d = new Date()
  d.getHours() + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds())

pad2 = (number) ->
  (if number < 10 then '0' else '') + number