# New App Generator
# -----------------
# Generates skeleton files needed to create a new SocketStream application

fs = require 'fs'
util = require 'util'

dir_mode = 0755

exports.generate = (name) ->
  return console.log "Please provide a name for your application: $> socketstream new <MyAppName>" if name is undefined
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

makeFiles = (dir) ->
  source_dir = "#{__dirname}/generator_files"
  files = [
    {destination: '/app/client/app.coffee',        source: '/app.client.coffee'}
    {destination: '/app/server/app.coffee',        source: '/app.server.coffee'}
    {destination: '/app/views/app.jade',           source: '/app.jade'}
    {destination: '/app/css/app.styl',             source: '/app.styl'}
    {destination: '/app/css/helpers.styl',         source: '/helpers.styl'}
    {destination: '/config/db.coffee',             source: '/config.db.coffee'}
    {destination: '/lib/css/reset.css',            source: '/reset.css'}
    {destination: '/lib/client/jquery-1.5.min.js', source: '/lib.client.jquery.min.js'}
    {destination: '/public/images/logo.png',       source: '/logo.png'}
  ]
  copyFile(source_dir + file.source, dir + file.destination) for file in files

copyFile = (source, destination) ->
  read = fs.createReadStream(source)
  write = fs.createWriteStream(destination)
  util.pump read, write

showFinishText = (name) ->
  console.log "Success! Created app #{name}. You can now run the app:"
  console.log "\t\t cd " + name
  console.log "\t\t socketstream start"
  
