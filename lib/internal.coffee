# Internal
# --------
# Functions and properties which are used internally throughout SocketStream

fs = require('fs')

exports.init = ->

  # Save a timestamp for benchmarking later
  @up_since = new Date
  
  # Counters
  @counters = {files_loaded: { models: 0, server: 0, shared: 0}}
  
  # Server files requiring authentication
  @authenticate = {}

  # Parse package.json so we don't have to repeat ourselves
  @package_json = loadPackageJSON()
  
  # Load last known state project was in, if it exists. We record this so we know when force a rebuild of client libraries on startup
  @last_known_state = loadState()
  
  @

# System uptime in ms (is this in Node anywhere?)
exports.uptime = ->
  (new Date) - @up_since

# Saves the current state once we've processed changes
exports.saveState = ->
  fs.writeFileSync(stateFileName(), JSON.stringify(@currentState()))
  @last_known_state = @currentState()

exports.currentState = ->
  version:
    server: $SS.version
    client: $SS.client.version

exports.clientVersionChanged = ->
  try
    $SS.libs.semver.gt @currentState().version.client, @last_known_state.version.client
  catch e
    true


# HELPERS

stateFileName = ->
  "#{$SS.root}/.socketstream_state"

loadState = ->
  try
    JSON.parse(fs.readFileSync(stateFileName()))
  catch e
    {} # no big deal if the file get's deleted or mangled, we just regenerate it

loadPackageJSON = ->
  try
    JSON.parse(fs.readFileSync(__dirname + '/../package.json'))
  catch e
    throw "Error: Unable to find or parse SocketStream's package.json file"
