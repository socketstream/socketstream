window.app =
  
  # This method is called automatically when the websocket connection is established. Do not rename/delete
  init: ->
    SS.server.app.init navigator.userAgent, (response) ->
      $('#message-from-server').text(response)
