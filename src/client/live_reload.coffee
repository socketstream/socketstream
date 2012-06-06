# Live Reload
# -----------
# Detects changes in client files and sends an event to connected browsers instructing them to refresh the page

require('colors')
pathlib = require('path')
chokidar = require('chokidar')

lastRun =
  updateCSS: Date.now()
  reload:    Date.now()

cssExtensions = ['.css', '.styl', '.stylus', '.less']

consoleMessage =
  updateCSS: 'CSS files changed. Updating browser...'
  reload:    'Client files changed. Reloading browser...'


module.exports = (ss, options) ->

  watchDirs = for dir in options.liveReload
    pathlib.join ss.root, options.dirs[dir]

  watcher = chokidar.watch watchDirs, { ignored: /(\/\.|~$)/ }
  watcher.on 'add', (path) -> onChange(path, 'added')
  watcher.on 'change', (path) -> onChange(path, 'changed')
  watcher.on 'unlink', (path) -> onChange(path, 'removed')
  watcher.on 'error', (error) -> console.log('✎'.red, "Error: #{error}".red)
    
  onChange = (path, event) ->
    action = if pathlib.extname(path) in cssExtensions then 'updateCSS' else 'reload'
    if (Date.now() - lastRun[action]) > 1000  # Reload browser max once per second
      console.log('✎'.green, consoleMessage[action].grey)
      ss.publish.all('__ss:' + action)
      lastRun[action] = Date.now()