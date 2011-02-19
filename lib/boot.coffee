# Boot file
# Sets up the $SS global variable and loads all the modules we need

fs = require('fs')
sys = require('util')
path = require('path')

# Define global $SS variable
global.$SS =
  version:          [0,0,6]         # TODO: Read this from package.json
  internal:         {}              # Used to store variables used internally
  libs:             {}              # Link all external modules we need throughout SocketStream here
  sys:              {}              # Link all internal SocketStream modules we will always need to have loaded here
  models:           {}              # Attach Realtime Models here
  redis:            {}              # Connect main and pubsub active connections here
  users:
    connected:      {}              # Maintain a list of all connected users for pub/sub

# Set root dir
$SS.root = fs.realpathSync()

# Load external libs used throughout SocketStream.
# TODO: Automate the loading and give guidence when correct version is missing
# Also it would be great if we could load whatever version is in package.json to avoid repitition
$SS.libs.coffee =     require('coffee-script@1.0.0')
$SS.libs.io =         require('socket.io@0.6.10')
$SS.libs.static =     require('node-static@0.5.3')
$SS.libs.jade =       require('jade@0.6.0')
$SS.libs.stylus =     require('stylus@0.5.1')
$SS.libs.uglifyjs =   require("uglify-js@0.0.3")
$SS.libs.redis =      require('redis@0.5.2')

# Load basic Array, String, JS extensions needed throughout SocketStream
require('./extensions')

# Set Framework Paths
require.paths.unshift('./lib/server')
require.paths.unshift('./app/shared')
require.paths.unshift('./app/models')

# Load any vendored modules
vendor_dir = "./vendor"
path.exists vendor_dir, (exists) ->
  if exists
    fs.readdirSync(vendor_dir).forEach (name) ->
      require.paths.unshift("#{vendor_dir}/#{name}/lib")

# Set default config and merge it with any application config file
require('./configurator.coffee').configure()

# Load SocketStream internal system modules we will *always* need to load
$SS.sys.log =     require('./logger.coffee')
$SS.sys.server =  new (require('./server.coffee').Server)
$SS.sys.asset =   new (require('./asset.coffee').Asset)
