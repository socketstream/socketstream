# New App Generator
# -----------------
# Generates skeleton files needed to create a new SocketStream application

require('colors')
log = console.log
fs = require 'fs'
util = require 'util'
copy = require '../utils/copy'

dir_mode = 0755

exports.generate = (name) ->
  return console.log "Please provide a name for your application: $> socketstream new <MyAppName>" if name is undefined
  if makeRootDirectory(name)
    source = __dirname + '/../../new_project'
    copy.recursiveCopy(source, name)
    showFinishText(name)

makeRootDirectory = (name) ->
  log "Creating a new SocketStream app called #{name}"
  try
    fs.mkdirSync name, dir_mode # Create the root directory
    return true
  catch e
    if e.code == 'EEXIST'
      log "Sorry the '#{name}' directory already exists. Please choose another name for your app."
      return false
    else
      throw e

showFinishText = (name) ->
  log "Success! Created app #{name}. You can now run the app:".green
  log "    cd " + name
  log "    sudo npm install"
  log "    npm link socketstream    (until 0.3 is published to npm)"
  log "    node app.js"
  log "Note: You're about to install our full recommended stack of optional modules".grey
  log "Feel free to remove any you don't need. A 'minimal install' option is coming soon".grey
