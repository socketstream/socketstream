# Frontend Server Manager
# -----------------------
# Listens for incoming HTTP requests and Socket.IO connections

file_utils = require('../utils/file')
check = require('../utils/check.coffee')

exports.bannerText = (standalone) ->
  servers = SS.internal.servers
  text = []
  text.push "Front end server connecting to router on #{SS.config.cluster.sockets.fe_main}" if standalone
  text.push "Primary web server listening on #{formatProtocol(servers.primary.protocol)}://#{servers.primary.config.hostname}:#{servers.primary.config.port}"
  text.push "Secondary web server listening on #{formatProtocol(servers.secondary.protocol)}://#{servers.secondary.config.hostname}:#{servers.secondary.config.port}" if servers.secondary  
  text

# Load all client-side files and check for conflicts
tree = file_utils.readDirSync(SS.root + '/app/client')
check.forNameConflicts([tree])

# Load Server
exports.server = require('./server.coffee')

# Listen for incoming events from router
require('./subscribe.coffee').init()


# Private

# Make HTTPS stand out
formatProtocol = (protocol) ->
  if protocol == 'https' then SS.log.color('https', 'green') else "http"