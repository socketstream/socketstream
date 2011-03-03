# Internal
# --------
# Functions and properties which are used internally throughout SocketStream

fs = require('fs')

exports.init = ->

  # Save a timestamp for benchmarking later
  @up_since = new Date
  
  # Counters
  @counters = {files_loaded: { model: 0, server: 0, shared: 0}}

  # Parse package.json so we don't have to repeat ourselves
  @package_json = loadPackageJSON()
  
  # Load last known state project was in, if it exists. We record this so we know when to upgrade project files
  @last_known_state = loadState()
  
  @

# System uptime in ms (is this in Node anywhere?)
exports.uptime = ->
  (new Date) - @up_since


# Saves the current state once we've processed changes
exports.saveState = ->
  fs.writeFileSync(stateFile(), JSON.stringify(@currentState()))
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

stateFile = ->
  "#{$SS.root}/.socketstream_state"

loadState = ->
  try
    JSON.parse(fs.readFileSync(stateFile()))
  catch e
    {} # no big deal if the file get's deleted or mangled, we'll just regenerate it

loadPackageJSON = ->
  try
    JSON.parse(fs.readFileSync(__dirname + '/../package.json'))
  catch e
    throw "Error: Unable to find or parse SocketStream's package.json file"
