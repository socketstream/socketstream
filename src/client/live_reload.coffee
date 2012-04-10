# Live Reload
# -----------
# Detects changes in client files and sends an event to connected browsers instructing them to refresh the page

require('colors')
fs = require('fs')
pathlib = require('path')
fileUtils = require('../utils/file')

lastReload = Date.now()

cssExtensions = ['css', 'styl', 'stylus', 'less']

consoleMessage =
  updateCSS: 'CSS files changed. Updating browser...'
  reload:    'Client files changed. Reloading browser...'


module.exports = (root, options, ss) ->

  handleFileChange = (action) ->
    if (Date.now() - lastReload) > 1000  # Reload browser max once per second
      console.log('✎'.green, consoleMessage[action].grey)
      ss.publish.all('__ss:' + action)
      lastReload = Date.now()

  assetsToWatch = ->
    output = {files: [], dirs: []}
    options.liveReload.forEach (dir) ->
      path = pathlib.join(root, options.dirs[dir])
      result = fileUtils.readDirSync(path)
      output.files = output.files.concat(result.files)
      output.dirs = output.dirs.concat(result.dirs)
    output

  allPaths = assetsToWatch()

  watch = (paths) ->
    paths.dirs.forEach (dir) -> fs.watch(dir, detectNewFiles)
    paths.files.forEach (file) ->
      extension = file.split('.')[file.split('.').length-1]
      changeAction = cssExtensions.indexOf(extension) >= 0 && 'updateCSS' || 'reload'
      fs.watch file, (event, filename) -> handleFileChange(changeAction)

  detectNewFiles = ->
    pathsNow = assetsToWatch()
    newPaths =
      dirs:  pathsNow.dirs.filter (dir) ->   allPaths.dirs.indexOf(dir) == -1
      files: pathsNow.files.filter (file) -> allPaths.files.indexOf(file) == -1
    watch(newPaths)
    allPaths = pathsNow
   
  watch(allPaths)
