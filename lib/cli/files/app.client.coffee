window.debug_level = 2

class window.App
  
  version: [0,0,1]
  
  constructor: ->
    
  init: ->
    remote 'app.init', navigator.userAgent, (response) ->
      alert(response)