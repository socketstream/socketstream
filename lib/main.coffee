# Socket Stream

fs = require('fs')
util = require('util')
path = require('path')


# Initialize SocketStream. This must always be run to set the basic environment
exports.init = ->

  # Define global $SS variable
  global.$SS =
    internal:         {}              # Used to store variables used internally
    client:           {}              # Used to store any info about the client (the JS code that's sent to the browser)
    config:           {}              # Used to store server and client configuration
    libs:             {}              # Link all external modules we need throughout SocketStream here
    sys:              {}              # Link all internal SocketStream modules we will always need to have loaded here
    models:           {}              # Attach Realtime Models here
    redis:            {}              # Connect main and pubsub active connections here
    users:
      connected:      {}              # Maintain a list of all connected users for pub/sub


  # Set root dir
  $SS.root = fs.realpathSync()

  # Properties and functions we need internally
  $SS.internal = require('./internal.coffee').init()

  # Set sever version from package.json
  $SS.version = $SS.internal.package_json.version

  # Set client file version. Bumping this automatically triggers re-compliation of lib assets when a user upgrades
  $SS.client.version = '0.0.1'

  # Set environment
  env = process.env.NODE_ENV || 'development'
  $SS.env = env.toString().toLowerCase()

  # Load basic Array, String, JS extensions needed throughout SocketStream
  require('./extensions')

  @


# Process incoming args from command line
exports.process = (args) ->
  exports.init()

  # If no arguments provided default to help page
  if typeof(args) == 'string'
    command       = 'help'
  else
    command       = args[1].toString().toLowerCase()
    params        = args.slice(2)

  # Process command
  switch command
    when 'start', 's'
      exports.start.server()
    when 'console', 'c'
      exports.start.console()
    when 'new', 'n'
      exports.create.project(params[0])
    when 'version', 'v'
      console.log('v' + $SS.version)
    when 'help', 'h'
      console.log '''
      SocketStream Command Line Help

        start (s)     Start server
        console (c)   Interactive console
        version (v)   Print version

      '''
    # Show this error if we're given an unknown command
    else
      console.log("Sorry, I do not know how to #{command}. Type \"socketstream help\" to see a list of commands.")


# Start methods load things
exports.start =

  server: ->
    util.log('Starting SocketStream server...')
    loadProject()
    $SS.sys.asset.init()
    $SS.sys.server.start()
    
  console: ->
    loadProject()
    console.log('\nSocketStream Version ' + $SS.version + ' running in ' + $SS.env)
    console.log('Press Control+C to quit the console\n')
    repl = require('repl')
    repl.start('SocketStream > ')


# Create methods make things
exports.create =

  project: (name) ->
    gen = require('./cli/app_generator.coffee')
    new gen.AppGenerator(name)


# Start up the SocketStream environment based on the current project. Needed for the Server and Console
loadProject = ->

  check.isValidProjectDir()
  load.externalLibs()
  load.vendoredModules()

  # Set Framework Paths
  require.paths.unshift('./lib/server')
  require.paths.unshift('./app/shared')
  require.paths.unshift('./app/models')

  # Set default config and merge it with any application config file
  require('./configurator.coffee').configure()

  # Load key SocketStream internal system modules we will *always* need to load
  $SS.sys.log =     require('./logger.coffee')
  $SS.sys.server =  new (require('./server.coffee').Server)
  $SS.sys.asset =   new (require('./asset.coffee').Asset)
  
  check.clientUpgradeRequired()
  
  # Load Redis. Note these connections stay open so scripts will cease to terminate on their own once you call this
  $SS.redis = require('./redis.coffee').connect()
  
  # Link SocketStream modules we offer as part of the Server API
  $SS.publish = require('./publish.coffee')
  
  load.dbConfigFile()



# PRIVATE HELPERS

check =
  
  isValidProjectDir: ->
    dirs = fs.readdirSync($SS.root)
    if (!dirs.include('app') || !dirs.include('public')) # All other dirs are optional for now
      throw 'Oops! Unable to start SocketStream here. Not a valid project directory'

  # Ensures SocketStream project files are up to date
  clientUpgradeRequired: ->
    if $SS.internal.clientVersionChanged()
      util.log("Thanks for upgrading SocketStream. Regenerating assets to include the latest client code...")
      $SS.sys.asset.pack.js.lib()
      $SS.internal.saveState()
      

load =

  # Load any vendored modules
  vendoredModules: ->
    vendor_dir = "./vendor"
    path.exists vendor_dir, (exists) ->
      if exists
        fs.readdirSync(vendor_dir).forEach (name) ->
          require.paths.unshift("#{vendor_dir}/#{name}/lib")

  # Load external libs used throughout SocketStream and attach them to $SS.libs
  # We load the exact version specified in package.json to be sure everything works well together
  # Hopefully in the future this will be possible automatically
  externalLibs: ->
    [
      ['coffee',    'coffee-script']
      ['io',        'socket.io']
      ['static',    'node-static']
      ['jade',      'jade']
      ['stylus',    'stylus']
      ['uglifyjs',  'uglify-js']
      ['redis',     'redis']
      ['semver',    'semver']
    ].forEach (lib) ->
      npm_name =  lib[1]
      try
        version =   $SS.internal.package_json.dependencies[lib[1]].substring(2)
      catch e
        throw "Unable to find #{npm_name} within the package.json dependencies"
      try
        $SS.libs[lib[0]] = require("#{npm_name}@#{version}")
      catch e
        throw "Unable to start SocketStream as we're missing the correct version of #{npm_name}.\nPlease install with 'sudo npm install #{npm_name}@#{version}'"

  dbConfigFile: ->
    db_config_file = $SS.root + '/config/db'
    try
      db_config_exists = require.resolve(db_config_file)
    require(db_config_file) if db_config_exists

