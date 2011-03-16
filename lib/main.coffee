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
    
    models:           {}              # Models are preloaded and placed here
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
    load.files()
  
  # Server-side files
  files: ->
    
    # Load Server-side functions into $SS.server
    load.dirFiles "#{$SS.root}/app/server", 'server', (mod, mod_name, dest, ary) ->
      dest[mod_name] = mod.actions
      $SS.internal.authenticate[ary.join('.')] = mod.authenticate if mod.authenticate
    
    # Load Shared functions into $SS.shared
    load.dirFiles "#{$SS.root}/app/shared", 'shared', (mod, mod_name, dest, ary) -> 
      dest[mod_name] = new mod[mod_name.capitalized()]

    # Load Realtime Models into $SS.models
    load.dirFiles "#{$SS.root}/app/models", 'models', (mod, mod_name, dest, ary) ->
      model_spec = mod[mod_name]
      dest[mod_name] = require("./realtime_models/adapters/#{model_spec.adapter}").init(mod_name, model_spec, exports)
      Object.defineProperty(dest[mod_name], '_rtm', {value: model_spec, enumerable: false})
  
  # Helper to recursively load all files in a dir and attach them to an attribtue of the $SS object
  dirFiles: (dir, name, action) ->
    recursively = (destination, ary, path, counter_name, index = 0) ->
      element = ary[index]
      dest = utils.getFromTree(destination, ary, index)
      if ary.length == (index + 1)
        mod = require(path)
        action(mod, element, dest, ary)
        $SS.internal.counters.files_loaded[counter_name]++
      else
        dest[element] = {} unless dest.hasOwnProperty(element)
        arguments.callee(destination, ary, path, counter_name, (index+1))

    output = file_utils.readDirSync(dir)
    if output
      slashes_to_remove = dir.split('/').length
      check.forNameConflicts(output)
      output.files.forEach (path) ->

        ary = path.split('/').slice(slashes_to_remove)
        mod_name = ary.pop()
        ary.push(mod_name.split('.')[0])

        recursively($SS[name], ary, path, name)

       
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
  

check =

  # Ensures you don't have a module and a folder of the same name (otherwise we can't map it to an object)
  forNameConflicts: (output) ->
    files_without_exts = output.files.map (file) -> file.split('.')[0]
    output.dirs.forEach (dir) ->
      files_without_exts.forEach (file) ->
        if file == dir
          fatal "Unable to load the #{dir} directory\nIt conflicts with a file of the same name in the parent directory. Please rename one of them."
  
  isValidProjectDir: ->
    dirs = fs.readdirSync($SS.root)
    if (!dirs.include('app') || !dirs.include('public')) # All other dirs are optional for now
      fatal 'Unable to start SocketStream here. Not a valid project directory'
      
fatal = (message) ->
  $SS.log.error.exception ['error', message]
  throw 'Unable to continue'

showBanner = (additional_text) ->
  counters = $SS.internal.counters.files_loaded
  util.puts "\n"
  util.puts "------------------------- SocketStream -------------------------"
  util.puts "  Version #{$SS.version} running in #{$SS.env} on PID #{process.pid}"
  util.puts "  Loaded #{counters.models.pluralize('model')}, #{counters.server} server and #{counters.shared.pluralize('shared file')} in #{$SS.internal.uptime()}ms"
  util.puts "  #{additional_text}"
  util.puts "----------------------------------------------------------------"
  util.puts "\n"
