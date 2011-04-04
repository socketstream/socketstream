# New App Generator
# -----------------
# Generates skeleton files needed to create a new SocketStream application

fs = require 'fs'

dir_mode = 0755

exports.generate = (name) ->
  return console.log "Please provide a name for your application: $> socketstream <MyAppName>" if name is undefined
  if makeRootDirectory(name)
    makeDirectories(name)
    makeFiles(name)
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

makeDirectories = (name) ->
  directories = ['/app', '/app/client', '/app/css', '/app/server', '/app/shared', '/app/views', '/lib', '/lib/client', '/lib/css', '/lib/server', '/public', '/public/assets', '/public/images', '/config', '/vendor']
  fs.mkdirSync name + directory, dir_mode for directory in directories

makeFiles = (name) ->
  filesDir = "#{__dirname}/generator_files"
  files = [
    {fileName: '/app/client/app.coffee',        dataFile: '/app.client.coffee'}
    {fileName: '/app/server/app.coffee',        dataFile: '/app.server.coffee'}
    {fileName: '/app/views/app.jade',           dataFile: '/app.jade'}
    {fileName: '/app/css/app.styl',             dataFile: '/app.styl'}
    {fileName: '/config/db.coffee',             dataFile: '/config.db.coffee'}
    {fileName: '/lib/css/reset.css',            dataFile: '/reset.css'}
    {fileName: '/lib/client/jquery-1.5.min.js', dataFile: '/lib.client.jquery.min.js'}
  ]
  fs.writeFileSync name + file.fileName, fs.readFileSync(filesDir + file.dataFile, 'utf-8') for file in files

showFinishText = (name) ->
  console.log "Success! Created app #{name}. You can now run the app:"
  console.log "\t\t cd " + name
  console.log "\t\t socketstream start"
  
