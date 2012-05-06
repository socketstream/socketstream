# Live Reload
# -----------
# Detects changes in client files and sends an event to connected browsers instructing them to refresh the page

require('colors')
fs = require('fs')
pathlib = require('path')
fileUtils = require('../utils/file')

lastRun =
  updateCSS: Date.now()
  reload:    Date.now()

cssExtensions = ['css', 'styl', 'stylus', 'less']

consoleMessage =
  updateCSS: 'CSS files changed. Updating browser...'
  reload:    'Client files changed. Reloading browser...'


module.exports = (ss, options) ->

  handleFileChange = (action) ->
    if (Date.now() - lastRun[action]) > 1000  # Reload browser max once per second
      console.log('✎'.green, consoleMessage[action].grey)
      ss.publish.all('__ss:' + action)
      lastRun[action] = Date.now()

  assetsToWatch = ->
    output = {files: [], dirs: []}
    options.liveReload.forEach (dir) ->
      path = pathlib.join(ss.root, options.dirs[dir])
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
      watcher = fs.watch file, (event) ->
        handleFileChange(changeAction)
        if event == "rename"
          watcher.close()
          # Disabling for now as file = the old filename and although fs.watch
          # should pass (event, filename) this does not work on all OSes
          #watch({files: [file], dirs: []})

  detectNewFiles = ->
    pathsNow = assetsToWatch()
    newPaths =
      dirs:  pathsNow.dirs.filter (dir) ->   allPaths.dirs.indexOf(dir) == -1
      files: pathsNow.files.filter (file) -> allPaths.files.indexOf(file) == -1
    watch(newPaths)
    allPaths = pathsNow
   
  watch(allPaths)
