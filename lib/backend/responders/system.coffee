# Request Handler for system functions
# ------------------------------------
# These are internal maintenance functions which are typically called at regular intervals

SS.backend.responders.on 'system:users:online:refresh', (obj, cb) ->
  SS.users.online && SS.users.online.update()