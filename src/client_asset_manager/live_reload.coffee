# Live Reload
# -----------
# Detects changes in client files and sends an event to connected browsers instructing them to refresh the page

require('colors')
fs = require('fs')
pathlib = require('path')
fileUtils = require('../utils/file')

lastReload = Date.now()

exports.init = (root, ss) ->

  handleFileChange = (action)->
    if (Date.now() - lastReload) > 1000  # Reload browser max once per second
      switch action
        when "update"
          console.log('✎'.green, 'Client files changed. Updating browser...'.grey)
          ss.publish.all('__ss:update')
        when "reload"
          console.log('✎'.green, 'Client files changed. Reloading browser...'.grey)
          ss.publish.all('__ss:reload')
      lastReload = Date.now()

  assetsToWatch = ->
    path = pathlib.join(root, 'client')
    fileUtils.readDirSync(path)

  allPaths = assetsToWatch()

  watch = (paths) ->
    paths.dirs.forEach (dir) ->   fs.watch(dir, detectNewFiles)
    paths.files.forEach (file) -> 
      extension = file.split('.')[file.split('.').length-1]
      if extension is 'styl' or extension is 'css'
        fs.watch file, (event, filename) -> handleFileChange('update')
      else
        fs.watch file, (event, filename) -> handleFileChange('reload')

  detectNewFiles = ->
    pathsNow = assetsToWatch()
    newPaths =
      dirs:  pathsNow.dirs.filter (dir) ->   allPaths.dirs.indexOf(dir) == -1
      files: pathsNow.files.filter (file) -> allPaths.files.indexOf(file) == -1
    watch(newPaths)
    allPaths = pathsNow
   
  watch(allPaths)
