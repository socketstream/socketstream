# New App Generator
# -----------------
# Generates skeleton files needed to create a new SocketStream application

fs = require 'fs'
util = require 'util'
copy = require './utils/copy'

dir_mode = 0755

exports.generate = (name) ->
  return console.log "Please provide a name for your application: $> socketstream new <MyAppName>" if name is undefined
  if makeRootDirectory(name)
    source = __dirname + '/../new_project'
    copy.recursiveCopy(source, name)
    showFinishText(name)

makeRootDirectory = (name) ->
  console.log "Creating a new SocketStream app called #{name}"
  try
    fs.mkdirSync name, dir_mode # Create the root directory
    return true
  catch e
    if e.code == 'EEXIST'
      console.log "Sorry the '#{name}' directory already exists. Please choose another name for your app."
      return false
    else
      throw e

showFinishText = (name) ->
  console.log "Success! Created app #{name}. You can now run the app:"
  console.log "\t\t cd " + name
  console.log "\t\t socketstream start"
  
