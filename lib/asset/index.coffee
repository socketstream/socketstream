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

# Load Asset sub-modules
exports.pack =     require('./pack.coffee').init(@).pack
exports.compile =  require('./compile.coffee').init(@).compile
exports.request =  require('./request.coffee').init(@).request

# Setup shared vars
exports.files =         {js: {}, css: {}}
exports.public_path =   './public/assets'
exports.client_dirs =   ['client', 'shared']

exports.init = ->
  findAssets =>
    ensureAssetsExist()
    upgradeAssetsIfRequired()
  if $SS.config.pack_assets
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
    watchForChangesInDir(asset[0], -> exports.pack[asset[1]][asset[2]]())

watchForChangesInDir = (dir, cb) ->
  fs.readdirSync(dir).map (file) ->
    path = "#{dir}/#{file}"
    fs.unwatchFile(path)
    fs.watchFile path, (curr, prev) ->
      if !curr or (Number(curr.mtime) > Number(prev.mtime))
        util.log("Change detected in #{path}. Recompiling client files...")
        cb()

ensureAssetsExist = ->
  unless exports.files.js.lib? and exports.files.css.lib? and exports.files.css.app?
    util.log "It looks like this is the first time you're running SocketStream. Generating asset files..."
    exports.pack.all()
    $SS.internal.saveState()

upgradeAssetsIfRequired = ->
  if $SS.internal.clientVersionChanged()
    util.log "Thanks for upgrading SocketStream. Regenerating assets to include the latest client code..."
    exports.pack.js.system()
    $SS.internal.saveState()

findAssets = (cb) ->
  files = utils.fileList exports.public_path
  files.filter((file) -> file.match(/(css|js)$/)).map (file) ->
    file_arr = file.split('.')
    ext = file_arr[file_arr.length - 1]
    type = file_arr[0].substring(0,3)
    f = exports.files[ext]
    f[type] = file
  cb()
  
