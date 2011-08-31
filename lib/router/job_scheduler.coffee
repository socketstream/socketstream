# Job Scheduler
# -------------
# Don't do much at the moment
# This file is included as part of the Router for now as only one server in the cluster can run the scheduler

rpc = new (require('../rpc/connection.coffee')).Client('scheduler')


# Will clear this mess up with a nice API in the future
exports.run = ->

  SS.config.users_online.enabled && setInterval(updateUsersOnline, SS.config.users_online.update_interval * 1000)


# Events

# Send a command to tell one of the back end workers to update the users online list
updateUsersOnline = ->
  rpc.send {responder: 'system:users:online:refresh'}