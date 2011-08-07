# Router Manager
# --------------
# The 'socketstream router' command launches this manager / wrapper process which spawns a single worker process
# and automatically restarts it in the tragic event of death

spawn = require('child_process').spawn

exports.bannerText = (standalone) ->
  [
    "ZeroMQ message router and event proxy"
    "Frontend main socket:   #{SS.config.cluster.sockets.fe_main}"
    "Frontend pub socket:    #{SS.config.cluster.sockets.fe_pub}"
    "Backend main socket:    #{SS.config.cluster.sockets.be_main}"
  ]

exports.init = ->
  startWorker()

startWorker = ->
  worker = spawn('socketstream', ['router-worker', '--show-traffic'])
  worker.stdout.on 'data', (data) -> console.log data.toString()
  worker.stderr.on 'data', (data) -> console.log data.toString()
  worker.on 'exit', (code, signal) ->
    console.log "Oh dear. The router died with code: #{code}, signal #{signal}"
    console.log 'Restarting router...'
    startWorker()