class exports.App
  
  init: (userAgent, cb) ->
    console.log "Welcome user of: #{userAgent}"
    cb 'Welcome. This message is sent from the server, so everything is working OK'