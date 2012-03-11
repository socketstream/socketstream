# New App Generator
# -----------------
# Generates skeleton files needed to create a new SocketStream application

log = console.log

require('colors')
fs = require('fs')
path = require('path')
util = require('util')
copy = require('../utils/copy')

dir_mode = 0755

exports.generate = (program) ->
  name = program.args[1]
  return console.log "Please provide a name for your application: $> socketstream new <MyAppName>" if name is undefined
  if makeRootDirectory(name)
    source = path.join(__dirname, '/../../new_project')

    copyOptions = 
      exclude:
        inPaths: ['/client/code/app', '/server/middleware', '/server/rpc']
        extensions: [program.coffee && '.js' || '.coffee']

    copy.recursiveCopy(source, name, copyOptions)


    # Show finish text

    log "Success! Created app '#{name}' with:".yellow
    log "  ✓".green, "Our recommended stack of optional modules", "(minimal install option coming soon)".grey
    if program.coffee
      log "  ✓".green, "CoffeeScript example code", "(-j if you prefer Javascript)".grey
    else
      log "  ✓".green, "Javascript example code", "(-c if you prefer CoffeeScript)".grey
    log "Next, run the following commands:".yellow
    log "    cd " + name
    log "    sudo npm install"
    log "    npm link socketstream", " (just until 0.3 is published to npm)".grey
    log "To start your app:".yellow
    log "    node app.js"




# Private

makeRootDirectory = (name) ->
  try
    fs.mkdirSync name, dir_mode # Create the root directory
    return true
  catch e
    if e.code == 'EEXIST'
      log "Sorry the '#{name}' directory already exists. Please choose another name for your app."
      return false
    else
      throw e
