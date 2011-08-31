# Backend Server Worker
# ---------------------
# Runs server-side actions and shared code, returning the result for the website or HTTP API

load = require('./loader.coffee')
check = require('../utils/check.coffee')

exports.bannerText = (standalone) ->
  counters = SS.internal.counters.files_loaded
  ["Back end server loaded #{counters.models.pluralize('model')}, #{counters.server} server and #{counters.shared.pluralize('shared file')} in #{SS.internal.uptime()}ms"]

# Connect any Plug Sockets if ZeroMQ is installed
if SS.config.plug_sockets.enabled
  if SS.internal.zmq
    require('./plug_sockets.coffee').init()
  else
    SS.config.plug_sockets.plugs.any() && SS.log.error.message('Warning: Plug Sockets disabled when running in single process mode. Please install ZeroMQ')

# Load any database connections
load.dbConfigFile()

# Load Event Emitter and custom server-side events
load.serverSideEvents()

# Load file 'trees' for each app folder
trees = load.fileTrees()

# Check none of the files and dirs conflict
check.forNameConflicts(trees)

# Load application files within /app/shared and /app/server
load.serverSideFiles(trees)

# Load Redis. Note these connections stay open so scripts will cease to terminate on their own once you call this
SS.redis = require('../redis.coffee').connect()

# Load publish API
SS.publish = require('./publish.coffee')

# Load optional Users Online module
SS.users.online = require('./users_online.coffee') if SS.config.users_online.enabled

# Listen for work
unless SS.internal.mode is 'console'

  # Load default message responders
  require('./responders')

  rpc = new (require('../rpc/connection.coffee')).Server

  # Listen for incoming requests and dispatch them to a responder
  rpc.listen (obj, cb) ->
    try      
      # First argument is the event name which a responder must listen for
      args = [obj.responder, obj]
      
      # If the request has an 'id' field it expects a callback (most system commands such as heartbeats do not)
      obj.id? && args.push cb
      
      # Emit the request to one or more responders
      SS.backend.responders.emit.apply SS.backend.responders, args
    catch e
      SS.log.error.exception(e)
