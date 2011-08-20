# Main SocketStream Loader
# ------------------------
# Should load everything you need (in the right order) and nothing else

fs = require('fs')
util = require('util')
path = require('path')
semver = require('semver')
utils = require('./utils')
file_utils = require('./utils/file')

# Initialize SocketStream. This must always be run to set the basic environment
exports.init = (load_project = false) ->

  # Define global SS variable
  global.SS =
    internal:         {}              # Used to store variables used internally
    client:           {}              # Used to store any info about the client (the JS code that's sent to the browser)
    config:           {}              # Used to store server and client configuration
    log:              {}              # Outputs to the terminal
    redis:            {}              # Connect main and pubsub active connections here
    
    models:           {}              # Models are preloaded and placed here
    server:           {}              # Server code is preloaded and placed here
    shared:           {}              # Shared code is preloaded and placed here

    frontend:         {}
    backend:          {}

    events:           {}              # Used to bind to internal server-side events
    plugs:            {}              # Bind plug sockets here

  # Set root dir
  SS.root = fs.realpathSync()

  # Properties and functions we need internally
  SS.internal = require('./internal.coffee').init()

  # Set server version from package.json
  SS.version = SS.internal.package_json.version

  # Set client file version. Bumping this automatically triggers re-compliation of lib assets when a user upgrades
  SS.client.version = '0.1.2'

  # Set environment
  env = process.env.SS_ENV || 'development'
  SS.env = env.toString().toLowerCase()

  # Load basic Array, String, JS extensions/helpers needed throughout SocketStream
  require('./helpers.js')
  
  load.project() if load_project

  @


# Process incoming args from command line
exports.process = (args) ->
  exports.init()

  # If no arguments provided default to help page
  if typeof(args.node) == 'string'
    command       = 'help'
  else
    command       = args.node[1].toString().toLowerCase()
    params        = args.node.slice(2)

  # Process command
  switch command
    when 'start', 's'
      start.server()
    when 'frontend', 'fe'
      start.frontend()
    when 'backend', 'be'
      start.backend(args)
    when 'benchmark', 'b'
      start.benchmark()
    when 'router', 'r'
      start.router()
    when 'console', 'c'
      start.console()
    when 'new', 'n'
      create.project(params[0])
    when 'version', 'v'
      console.log('v' + SS.version)
    when 'help', 'h'
      console.log '''
      SocketStream Command Line Help

        start (s)       Start server
        frontend (fe)   Start the front end server manager
        backend (be)    Start the back end server manager
        router (r)      Start the router / message broker
        console (c)     Interactive console
        benchmark (b)   Run benchmark suite
        version (v)     Print current version
        new (n)         Create new project

      '''

    # For internal use only (called by the process manager)
    when 'backend-worker'
      load.project()
      require('./backend/worker.coffee')
    when 'router-worker'
      load.project()
      require('./router/worker.coffee').init(args)

    # Show this error if we're given an unknown command
    else
      console.log("Sorry, I do not know how to #{command}. Type \"socketstream help\" to see a list of commands.")


# Start methods load things
start =

  server: ->
    SS.internal.mode = 'integrated'
    util.log('Starting SocketStream server...')
    load.project()
    frontend = require('./frontend')
    require('./router/worker.coffee').init()
    backend = require('./backend')
    backend.init()
    servers = frontend.server.start()
    banner_text = frontend.bannerText().concat(backend.bannerText())
    showBanner banner_text
    
  console: ->
    SS.internal.mode = 'console'
    load.project()
    require('./frontend')
    require('./backend/worker.coffee')
    showBanner('Press Control + C twice to quit the Interactive Console')
    repl = require('repl')
    repl.start('SocketStream > ')

  frontend: ->
    SS.internal.mode = 'frontend'
    load.project()
    frontend = require('./frontend')
    servers = frontend.server.start()
    showBanner frontend.bannerText(true)
  
  backend: (args) ->
    SS.internal.mode = 'backend'
    load.project()
    backend = require('./backend')
    backend.init(args)
    showBanner backend.bannerText(true)
  
  router: (args) ->
    SS.internal.mode = 'router'
    load.project()
    router = require('./router')
    router.init(args)
    showBanner router.bannerText(true)

  benchmark: ->
    SS.internal.mode = 'benchmark'
    load.project()
    benchmark = require('./benchmark')
    showBanner benchmark.bannerText()
    benchmark.run()


# Create methods make things
create =

  project: (name) ->
    require('./generator.coffee').generate(name)


# PRIVATE HELPERS

load =

  # Start up the SocketStream environment based on the current project
  # Needs to run before the Server or Console can start
  project: ->
  
    # Load logger
    SS.log = require('./logger.coffee')

    # Load the basics and run a number of checks
    check.isValidProjectDir()
    check.versionIsCorrect()
    check.forTmpDir()

    # Set Framework Paths (you must use /node_modules in Node 0.5 and above)
    if process.version.split('.')[1] == '4'
      require.paths.unshift('./lib/server')
      require.paths.unshift('./app/shared')
      require.paths.unshift('./app/models')

    # Set default config and merge it with any application config file
    require('./configurator.coffee').configure()
    
    # Alias SS to SS.config.ss_var to allow for other custom variable name if desired
    global[SS.config.ss_var] = SS if SS.config.ss_var and SS.config.ss_var != 'SS'

    # Save current state
    SS.internal.state.save()


check =

  forTmpDir: ->
    try
      fs.mkdirSync SS.root + '/tmp', '766'

  # Quick check to make sure we have two key ingredients for a valid project
  isValidProjectDir: ->
    dirs = fs.readdirSync(SS.root)
    if (!dirs.include('app') || !dirs.include('public')) # All other dirs are optional for now
      fatal 'Unable to start SocketStream here. Not a valid project directory'
  
  # Version numbers
  versionIsCorrect: ->
    return true if semver.parse(SS.version)[5]? # Ignore previews, betas, etc
    out_of_date = try
       semver.gt(SS.internal.state.last_known.version.server, SS.version)
    catch e
      false
    fatal("This application is running an outdated version of SocketStream.\nPlease upgrade to #{SS.internal.state.last_known.version.server} or above to ensure the app runs as expected, or delete the .socketstream_state file to override this error.") if out_of_date


# Throw a fatal error
fatal = (message) ->
  SS.log.error.message message
  throw 'Unable to continue: '

# Show welcome banner
showBanner = (additional_text) ->
  util.puts "\n------------------------------ SocketStream ------------------------------"
  text = ["Version #{SS.version} running in #{SS.env} on PID #{process.pid}"]
  text = text.concat(additional_text)
  text.forEach (line) -> util.puts '  ' + line
  util.puts "--------------------------------------------------------------------------\n"
  
