# Client-side Code

# This method is called automatically when the websocket connection is established. Do not rename/delete
exports.init = ->
  SS.server.app.init (response) ->
    $('#message').text(response)
  
  SS.socket.on 'disconnect', ->
    $('#message').text('SocketStream server has gone down :-(')

  SS.socket.on 'connect', ->
    $('#message').text('SocketStream server is back up :-)')
    
