exports.actions =
  
  init: (userAgent, cb) ->
    console.log "Welcome user of: #{userAgent}"
    cb "SocketStream version #{$SS.version} is up and running. This message is sent from the server, so everything is working OK."
