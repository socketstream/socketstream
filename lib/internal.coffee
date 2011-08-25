# Internal
# --------
# Functions and properties which are used internally throughout SocketStream

fs = require('fs')
semver = require('semver')

# TODO: Refactor this now we have front end / back end separation
exports.init = ->

  ### COMMON ###

  # Mode we're running in - e.g. 'integrated', 'console', 'backend'
  @mode = null

  # Parse package.json so we don't have to repeat ourselves
  @package_json = loadPackageJSON()

  # Load last known state project was in, if it exists. We record this so we know when force a rebuild of client libraries on startup
  @state = state.init()

  # Save a timestamp for benchmarking later
  @up_since = new Date

  # RPC layer
  @rpc = {version: 1, clients: {}, server: null, event_proxy: null}


  ### FRONT END ###

  # Store sockets indexed by session.id
  @sessions = {}

  # Store any running HTTP(S) servers here
  @servers = {}


  ### BACK END ###
  
  # Counters
  @counters = {files_loaded: { models: 0, server: 0, shared: 0}}
  
  # Server files requiring authentication
  @authenticate = {}
  
  # Store the API string we send to the clients here
  @api_string = {}

  @

# System uptime in ms (is this in Node anywhere?)
exports.uptime = ->
  (new Date) - @up_since


# SocketStream State
# Used to determin when client assets need to be rebuilt or other upgrade tasks run
state =

  init: ->
    @file_name = "#{SS.root}/.socketstream_state"
    @last_known = @load()
    @
    
  current: ->
    version:
      server: SS.version
      client: SS.client.version

  save: ->
    fs.writeFileSync(@file_name, JSON.stringify(@current()))
    
  load: ->
    try
      JSON.parse(fs.readFileSync(@file_name))
    catch e
      {} # no big deal if the file get's deleted or mangled, we just regenerate it

  clientVersionUpgraded: ->
    try
      semver.gt @current().version.client, @last_known.version.client
    catch e
      false
  
  # The last known state was never loaded
  missing: ->
    typeof(@last_known.version) != 'object'

  # Deletes the state file, forcing rebuild of assets etc next time round
  reset: ->
    try
      fs.unlinkSync @file_name
    catch e
      # do nothing if file doesn't exist


# HELPERS

loadPackageJSON = ->
  try
    JSON.parse(fs.readFileSync(__dirname + '/../package.json'))
  catch e
    throw "Error: Unable to find or parse SocketStream's package.json file"
