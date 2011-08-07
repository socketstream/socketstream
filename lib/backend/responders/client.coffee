# Request Handler for Client functions
# ------------------------------------
# Used to handle incoming requests when websocket clients connect/disconnect

Session = require('../session.coffee').Session
utils = require('../../utils')

# This is the initial object sent to the SocketStream JS client upon connection
SS.backend.responders.on 'client:init', (obj, cb) ->
  if obj.session_id
    session = new Session(obj.session_id)
    SS.log.outgoing.client(obj, 'init')
    output = 
      session_id:       obj.session_id
      env:              SS.env                                                                  # Makes the SS.env variable available client-side. Can be useful within client code
      config:           SS.config.client                                                        # Copies any client configuration settings from the app config files to the client
      heartbeat:        SS.config.users.online.enabled                                          # Let's the client know if User Online tracking is enabled
      api:                                                                       
        server:         SS.internal.api_string.server                                           # Transmits a string representation of the Server API
        models:         (if SS.config.rtm.enabled then SS.models.keys() else {})
    cb {type: 'client:init', data: output, id: obj.id}
    SS.events.emit 'client:init', session

# This message is sent either when the user closes down the browser window or the Socket.IO session times out
SS.backend.responders.on 'client:disconnect', (obj, cb) ->
  if obj.session_id
    session = new Session(obj.session_id)
    session.getUserId ->
      SS.log.outgoing.client(obj, 'disconnect')
      SS.events.emit 'client:disconnect', session

# A heartbeat is sent every X seconds by clients
# We will work to make this method faster in the future
SS.backend.responders.on 'client:heartbeat', (obj, cb) ->
  if obj.session_id
    session = new Session(obj.session_id)
    session.getUserId ->
      SS.users.online.confirm(session.user_id) if session.user_id
      SS.events.emit 'client:heartbeat', session