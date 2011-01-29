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
    directories = ['/app', '/app/client', '/app/sass', '/app/server', '/app/views', '/lib', '/lib/client', '/lib/css', '/lib/server', '/public', '/public/assets', '/public/dev', '/vendor']
    console.log "Creating a new SocketStream app called " + @name
    fs.mkdirSync @name, mode # Create the root directory
    fs.mkdirSync @name + directory, mode for directory in directories
    
  makeFiles: (@name) ->
    files = [
      {fileName: '/app/client/app.coffee', data: 'window.debug_level = 2\n\nclass window.App\n\n\tversion: [0,0,1]\n\n\tconstructor: ->'}
      {fileName: '/app/sass/app.sass',     data: ''}
      {fileName: '/app/server/app.coffee', data: 'class exports.App\n\n\tinit: (cb) ->\n\t\tcb true'}
      {fileName: '/app/views/index.jade',  data: 'html\n\thead\n\thead\n\t\ttitle '+@name+'\n\tbody'}
      {fileName: '/app.coffee',            data: "app = require('socketstream').init(__dirname)\napp.start()"}      
      {fileName: '/lib/css/reset.css',     data: ''}
      {fileName: '/lib/nodemon-ignore',    data: ''}
    ]
    fs.writeFileSync @name + file.fileName, file.data for file in files
    
args = argParser.parse()
new AppGenerator args.node[1]

#TODO replace 'socketstream <APPNAME>' with 'socketstream new <APPNAME>'
#TODO have socketstream list all of the commands in nice fashion.
#TODO replace reset.css with something like meyer's css reset
#TODO replace index.jade with cool socketstream index page
#TODO replace app.sass with stylesheet for socketstream index page