# Live Reload
# -----------
# Detects changes in client files and sends an event to connected browsers instructing them to refresh the page

require('colors')
fs = require('fs')
pathlib = require('path')
fileUtils = require('../utils/file')

lastReload = Date.now()

exports.init = (root, ss) ->

  handleFileChange = ->
    if (Date.now() - lastReload) > 1000  # Reload browser max once per second
      console.log('✎'.green, 'Client files changed. Reloading browser...'.grey)
      ss.publish.all('__ss:reload')
      lastReload = Date.now()

  assetsToWatch = ->
    path = pathlib.join(root, 'client')
    fileUtils.readDirSync(path)

  allPaths = assetsToWatch()

  watch = (paths) ->
    paths.dirs.forEach (dir) ->   fs.watch(dir, detectNewFiles)
    paths.files.forEach (file) -> fs.watch(file, handleFileChange)

  detectNewFiles = ->
    pathsNow = assetsToWatch()
    newPaths =
      dirs:  pathsNow.dirs.filter (dir) ->   allPaths.dirs.indexOf(dir) == -1
      files: pathsNow.files.filter (file) -> allPaths.files.indexOf(file) == -1
    watch(newPaths)
    allPaths = pathsNow
   
  watch(allPaths)
