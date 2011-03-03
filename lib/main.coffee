# Socket Stream

fs = require('fs')
util = require('util')
path = require('path')
utils = require('./utils')
file_utils = require('./utils/file')

# Initialize SocketStream. This must always be run to set the basic environment
exports.init = ->

  # Define global $SS variable
  global.$SS =
    internal:         {}              # Used to store variables used internally
    client:           {}              # Used to store any info about the client (the JS code that's sent to the browser)
    config:           {}              # Used to store server and client configuration
    libs:             {}              # Link all external modules we need throughout SocketStream here
    log:              {}              # Outputs to the terminal
    redis:            {}              # Connect main and pubsub active connections here
    
    model:            {}              # Models are preloaded and placed here
    server:           {}              # Server code is preloaded and placed here
    shared:           {}              # Shared code is preloaded and placed here

    users:
      connected:      {}              # Maintain a list of all connected users for pub/sub


  # Set root dir
  $SS.root = fs.realpathSync()

  # Properties and functions we need internally
  $SS.internal = require('./internal.coffee').init()

  # Set server version from package.json
  $SS.version = $SS.internal.package_json.version

  # Set client file version. Bumping this automatically triggers re-compliation of lib assets when a user upgrades
  $SS.client.version = '0.0.1'

  # Set environment
  env = process.env.SS_ENV || 'development'
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
    load.project()
    require('./server.coffee').start()
    protocol = if $SS.config.ssl.enabled then $SS.log.color('https', 'green') else "http"
    showBanner("Server running on #{protocol}://localhost:#{$SS.config.port}")
    
  console: ->
    load.project()
    repl = require('repl')
    showBanner('Press Control + C twice to quit the Interactive Console')
    repl.start('SocketStream > ')


# Create methods make things
exports.create =

  project: (name) ->
    gen = require('./cli/app_generator.coffee')
    new gen.AppGenerator(name)



# PRIVATE HELPERS

load =

  # Start up the SocketStream environment based on the current project
  # Needs to run before the Server or Console can start
  project: ->

    check.isValidProjectDir()
    load.externalLibs()
    load.vendoredModules()

    # Set Framework Paths
    require.paths.unshift('./lib/server')
    require.paths.unshift('./app/shared')
    require.paths.unshift('./app/models')

    # Load logger
    $SS.log = require('./logger.coffee')
    
    # Set default config and merge it with any application config file
    require('./configurator.coffee').configure()
    
    # Load Redis. Note these connections stay open so scripts will cease to terminate on their own once you call this
    $SS.redis = require('./redis.coffee').connect()
    
    # Link SocketStream modules we offer as part of the Server API
    $SS.publish = require('./publish.coffee')
    
    load.dbConfigFile()
    load.files.all()
  
  # Server-side files
  files:
    
    all: ->
      @models() # loads into $SS.model
      load.dirFiles("#{$SS.root}/app/server", 'server') # loads into $SS.server
      load.dirFiles("#{$SS.root}/app/shared", 'shared') # loads into $SS.shared

    # Pre-loads all code in /app/models into $SS.model
    models: ->
      # See if we have any models to load
      files = try
        fs.readdirSync("#{$SS.root}/app/models").filter((file) -> !file.match(/(^_|^\.)/))
      catch e
        []
      # Preload all model definitions
      if files.length > 0
        models = files.map((file) -> file.split('.')[0])
        models.forEach (model) ->
          model_name = model.split('/').pop()
          model_spec = require("#{$SS.root}/app/models/#{model_name}")[model_name]
          $SS.model[model_name] = require("./realtime_models/adapters/#{model_spec.adapter}").init(model_name, model_spec, exports)
          Object.defineProperty($SS.model[model_name], '_rtm', {value: model_spec, enumerable: false})
          $SS.internal.counters.files_loaded.model++
  
       
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
  
  # Helper to recursively load all files in a dir and attach them to the $SS object
  dirFiles: (dir, name) ->
    recursively = (destination, ary, path, counter_name, index = 0) ->
      element = ary[index]
      mod_name = element.split('.')[0]
      dest = utils.getFromTree(destination, ary, index)
      if ary.length == (index + 1) # load the module and attach an instance
        mod = require(path)
        dest[mod_name] = new mod[mod_name.capitalized()]
        $SS.internal.counters.files_loaded[counter_name]++
      else # or continue traversing the path
        if dest.hasOwnProperty(element)
          stop("Oops! Unable to load #{ary.join('/')} as it conflicts with a file called '#{element}' in the parent directory.\nPlease rename/remove one of them.")
        else
          dest[element] = {}
          arguments.callee(destination, ary, path, counter_name, (index+1))
  
    slashes_to_remove = dir.split('/').length
    try
      file_utils.readDirSync(dir).files.forEach (path) ->
        ary = path.split('/').slice(slashes_to_remove)
        recursively($SS[name], ary, path, name)
    catch e
      throw e unless e.code == 'ENOENT' # Ignore if optional dirs are missing
  
 
check =
  
  isValidProjectDir: ->
    dirs = fs.readdirSync($SS.root)
    if (!dirs.include('app') || !dirs.include('public')) # All other dirs are optional for now
      throw 'Oops! Unable to start SocketStream here. Not a valid project directory'
      
stop = (message) ->
  $SS.log.error.exception ['error', message]
  throw 'Unable to continue'

showBanner = (additional_text) ->
  counters = $SS.internal.counters.files_loaded
  util.puts "\n"
  util.puts "------------------------- SocketStream -------------------------"
  util.puts "  Version #{$SS.version} running in #{$SS.env} on PID #{process.pid}"
  util.puts "  Loaded #{counters.model.pluralize('model')}, #{counters.server} server and #{counters.shared.pluralize('shared file')} in #{$SS.internal.uptime()}ms"
  util.puts "  #{additional_text}"
  util.puts "----------------------------------------------------------------"
  util.puts "\n"
