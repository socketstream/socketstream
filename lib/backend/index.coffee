# Backend Server Manager
# ----------------------
# Manages back end worker processes which respond to incoming requests

fs = require('fs')
spawn = require('child_process').spawn

file_utils = require('../utils/file.js')

num_workers = 1

# Store worker processes here
_workers = []

exports.bannerText = (standalone) ->
  counters = SS.internal.counters.files_loaded
  text = []
  text.push "Back end server connecting to #{SS.config.cluster.sockets.be_main}" if standalone
  text.push "Spawned #{num_workers} back end worker #{if num_workers == 1 then 'process' else 'processes'} (PID #{(_workers.map (worker) -> worker.pid).join(', ')})"
  # TODO: Can we put this back in, despite the fact the data lives in another process.... maybe not
  # "Back end server loaded #{counters.models.pluralize('model')}, #{counters.server} server and #{counters.shared.pluralize('shared file')} in #{SS.internal.uptime()}ms"
  text.push "Plug Sockets: Binding SS.plugs.#{name} to #{details.connect_to}" for name, details of SS.config.plugs
  text


exports.init = (args) ->

  # Number of worker processes to start
  num_workers = if args then (parseInt(args['-w']) || 2) else 1

  # Start worker processes
  startWorker() for num in [1..num_workers]
  
  # Watch files for changes
  watchForChanges() if SS.env == 'development'


# PRIVATE

startWorker = ->

  worker = spawn('socketstream', ['backend-worker'])

  worker.stdout.on 'data', (data) ->
    console.log data.toString()

  worker.stderr.on 'data', (data) ->
    console.log data.toString()

  worker.on 'exit', (code, signal) ->
    startWorker() unless code == 1 and SS.env == 'development'
  
  _workers.push(worker)


# Kill worker process if any files change (manager will re-spawn)
watchForChanges = ->
  dirs = ['/app/server', '/app/models', '/app/shared', '/config']
  dirs.forEach (dir) ->
    tree = file_utils.readDirSync(SS.root + dir)
    if tree.files
      tree.files.forEach (path) ->
        fs.watchFile path, (curr, prev) ->
          if !curr or (Number(curr.mtime) > Number(prev.mtime))
            console.log "Change detected in #{path}. Restarting back end workers..."
            _workers.forEach (worker) -> worker.kill 'SIGHUP'            
            # Note: this only works when you're running the integrated 'socketstream server' as you typically would in development
            # It should really be fired once the worker has reloaded. Will improve in the future
            SS.io.sockets.emit('client:reload') if SS.io 

