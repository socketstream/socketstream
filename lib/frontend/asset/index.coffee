# Asset Manager
# -------------

fs = require('fs')
util = require('util')

EventEmitter = require('events').EventEmitter
emitter = new EventEmitter

utils = require('./utils.coffee')

# Directories to monitor for changes. TODO: make it work when you add new files
watch_dirs = [
  ['./lib/client', 'js', 'lib'],
  ['./lib/css', 'css', 'lib'],
  ["#{__dirname}/../client/js", 'js', 'system'],
  ["#{__dirname}/../client", 'js', 'system'],
]

default_directory_mode = 0755

# Load Asset sub-modules
exports.pack =     require('./pack.coffee').init(@).pack
exports.compile =  require('./compile.coffee').init(@).compile

# Setup shared vars
exports.files =         {js: {}, css: {}}
exports.public_path =   './public/assets'
exports.client_dirs =   ['client', 'shared']

exports.init = ->
  findAssets =>
    ensureAssetsExist()
    upgradeAssetsIfRequired()
  if SS.config.pack_assets
    @pack.all()
  else
    @monitor()

# Monitor file changes (useful when developing)
exports.monitor = ->
  emitter.on 'regenerate_html', ->
    exports.pack.html.app -> watch()
  watch()


# PRIVATE

watch = ->
  @timestamp = Date.now()
  watch_dirs.map (asset) ->
    watchForChangesInDir asset[0], ->
      exports.pack[asset[1]][asset[2]]()
      SS.io.sockets.emit('reload')

watchForChangesInDir = (dir, cb) ->
  fs.readdirSync(dir).map (file) ->
    path = "#{dir}/#{file}"
    fs.unwatchFile(path)
    fs.watchFile path, (curr, prev) ->
      if !curr or (Number(curr.mtime) > Number(prev.mtime))
        util.log("Change detected in #{path}. Recompiling client files...")
        cb()

ensureAssetsExist = ->
  unless exports.files.js.lib? and exports.files.css.lib?
    util.log "Generating essential asset files to get you started..."
    try
      ensurePublicPathExists()
      exports.pack.libs()
      SS.internal.state.save()
      SS.internal.state.last_known = SS.internal.state.current()
    catch e
      SS.internal.state.reset()
      SS.log.error.exception e
      throw 'Error: Unable to generate client assets libraries. Please ensure you have the latest version of SocketStream and try again.'

upgradeAssetsIfRequired = ->
  if (upgraded = SS.internal.state.clientVersionUpgraded()) or SS.internal.state.missing()
    if upgraded
      util.log "Thanks for upgrading SocketStream. Regenerating assets to include the latest client code..."
    else
      util.log "Regenerating client asset files..."
    exports.pack.js.lib()
    SS.internal.state.save()

findAssets = (cb) ->
  files = utils.fileList exports.public_path
  files.filter((file) -> file.match(/(css|js)$/)).map (file) ->
    file_arr = file.split('.')
    ext = file_arr[file_arr.length - 1]
    type = file_arr[0].substring(0,3)
    f = exports.files[ext]
    f[type] = file
  cb()

ensurePublicPathExists = ->
  try
    fs.mkdirSync(exports.public_path, default_directory_mode)
  catch e
    throw(e) unless e.code == 'EEXIST'
