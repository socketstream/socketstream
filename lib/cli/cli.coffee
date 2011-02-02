argParser = require 'argsparser'
fs        = require 'fs'

class AppGenerator
  
  constructor: (@name) ->
    return console.log "Please provide a name for your application: $> socketstream <MyAppName>" if @name is undefined
    @makeDirectories @name
    @makeFiles @name
    console.log "Created app " + @name + ". You can now run the app:"
    console.log "\t\t cd " + @name
    console.log "\t\t node app.coffee"
  
  makeDirectories: (@name) ->
    mode = 0755
    directories = ['/app', '/app/client', '/app/css', '/app/server', '/app/views', '/lib', '/lib/client', '/lib/css', '/lib/server', '/public', '/public/assets', '/vendor']
    console.log "Creating a new SocketStream app called " + @name
    fs.mkdirSync @name, mode # Create the root directory
    fs.mkdirSync @name + directory, mode for directory in directories
    
  makeFiles: (@name) ->
    filesDir = fs.realpathSync(__filename).replace('/cli.coffee','') + '/files' # TODO - find a less brittle way
    files = [
      {fileName: '/app/client/app.coffee',        dataFile: '/app.client.coffee'}
      {fileName: '/app/server/app.coffee',        dataFile: '/app.server.coffee'}
      {fileName: '/app/views/app.jade',           dataFile: '/app.jade'}
      {fileName: '/app/css/app.styl',             dataFile: '/app.styl'}
      {fileName: '/app.coffee',                   dataFile: '/app.coffee'}      
      {fileName: '/lib/css/reset.css',            dataFile: '/reset.css'}
      {fileName: '/lib/client/jquery-1.5.min.js', dataFile: '/lib.client.jquery-1.5.min.js'}
    ]
    fs.writeFileSync @name + file.fileName, fs.readFileSync(filesDir+file.dataFile, 'utf-8') for file in files
    
args = argParser.parse()
new AppGenerator args.node[1]

#TODO replace 'socketstream <APPNAME>' with 'socketstream new <APPNAME>'
#TODO have socketstream list all of the commands in nice fashion.
#TODO replace index.jade with cool socketstream index page
#TODO replace app.styl with stylesheet for socketstream index page
