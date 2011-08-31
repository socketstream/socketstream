# Backend Worker - Process Wrapper
# --------------------------------
# Manages back end worker processes which respond to incoming requests, restarting them if required

fs = require('fs')
spawn = require('child_process').spawn

file_utils = require('../utils/file.js')

# Store worker processes here
_workers = []

# Declare variable in module scope
num_workers = 1

exports.bannerText = (standalone) ->
  counters = SS.internal.counters.files_loaded
  text = []
  text.push "Back end server connecting to #{SS.config.cluster.sockets.be_main}" if standalone
  text.push "Spawned #{num_workers} back end worker #{if num_workers == 1 then 'process' else 'processes'} (PID #{(_workers.map (worker) -> worker.pid).join(', ')})"
  SS.config.plug_sockets.enabled && text.push "Plug Sockets: Binding SS.plugs.#{name} to #{details.connect_to}" for name, details of SS.config.plug_sockets.plugs
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
    # Would be nice to find a better way to prevent two line breaks
    console.log data.toString().replace("\n",'')

  worker.stderr.on 'data', (data) ->
    console.log data.toString().replace("\n",'')

  worker.on 'exit', (code, signal) ->
    startWorker() unless code == 1 and SS.env == 'development'
  
  _workers.push(worker)


# Kill worker process if any files change (manager will re-spawn)
watchForChanges = ->
  dirs = ['/app/server', '/app/models', '/app/shared', '/config', '/lib/server']
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
            SS.io.sockets.emit('reload') if SS.io 

