# Request Handler for Client functions
# ------------------------------------
# Used to handle incoming requests when websocket clients connect/disconnect

Session = require('../session.coffee').Session
utils = require('../../utils')

# Listen out for Client messages
SS.backend.responders.on 'client', (obj, cb) ->
  SS.log.outgoing.client(obj, obj.method)
  if obj.session
    session = new Session(obj.session)
    methods[obj.method](obj, session, cb)

methods =
  
  # This is the initial object sent to the SocketStream JS client upon connection
  init: (obj, session, cb) ->
    session._findOrCreate ->
      output =
        session:            session._data()
        send_to_client:
          session_id:       session.id
          env:              SS.env                                                                  # Makes the SS.env variable available client-side. Can be useful within client code
          config:           SS.config.client                                                        # Copies any client configuration settings from the app config files to the client
          heartbeat:        SS.config.users_online.enabled                                          # Let's the client know if User Online tracking is enabled
          api:                                                                       
            server:         SS.internal.api_string.server                                           # Transmits a string representation of the Server API
            models:         (if SS.config.rtm.enabled then SS.models.keys() else {})
      cb {id: obj.id, result: output}
      SS.events.emit 'client:init', session

  # This message is sent either when the user closes down the browser window or the Socket.IO session times out
  disconnect: (obj, session, cb) ->
    SS.events.emit 'client:disconnect', session

  # A heartbeat is sent every SS.config.client.heartbeat_interval seconds by connected clients
  heartbeat: (obj, session, cb) ->
    SS.users.online.confirm(session.user_id) if SS.users.online && session.user_id
    SS.events.emit 'client:heartbeat', session