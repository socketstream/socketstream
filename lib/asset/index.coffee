# Asset Manager
# -------------

fs = require('fs')
util = require('util')

EventEmitter = require('events').EventEmitter
emitter = new EventEmitter

utils = require('./utils.coffee')

self = {}
class exports.Asset

  public_path: './public/assets'
  system_path: __dirname + '/../client'
  client_dirs: ['client', 'shared']

  watch_dirs: [
    ['./lib/client', 'js', 'lib'],
    ['./lib/css', 'css', 'lib'],
    ["#{__dirname}/../client/js", 'js', 'system'],
    ["#{__dirname}/../client", 'js', 'system'],
  ]

  constructor: (@options = {}) ->
    self = @
    @files = {js: {}, css: {}}
    @pack = require('./pack.coffee').init(self).pack
    @compile = require('./compile.coffee').init(self).compile
    @request = require('./request.coffee').init(self).request
    
  init: ->
    if $SS.config.pack_assets
      @pack.all()
    else
      @monitor()
    @_findAssets =>
      @_ensureAssetsExist()
      @_upgradeAssetsIfRequired()
  
  monitor: ->
    emitter.on 'regenerate_html', ->
      self.pack.html.app -> self.watch()
    self.watch()
  
  watch: ->
    self.timestamp = Date.now()
    @watch_dirs.map (asset) ->
      self._watchForChangesInDir(asset[0], -> self.pack[asset[1]][asset[2]]())


  
  # Private helper methods

  _findAssets: (cb) ->
    files = utils.fileList self.public_path
    files.filter((file) -> file.match(/(css|js)$/)).map (file) ->
      file_arr = file.split('.')
      ext = file_arr[file_arr.length - 1]
      type = file_arr[0].substring(0,3)
      f = self.files[ext]
      f[type] = file
    cb()
 
  _ensureAssetsExist: ->
    unless self.files.js.lib? and self.files.css.lib? and self.files.css.app?
      util.log "It looks like this is the first time you're running SocketStream. Generating asset files..."
      self.pack.all()
      $SS.internal.saveState()
  
  _upgradeAssetsIfRequired: ->
    if $SS.internal.clientVersionChanged()
      util.log "Thanks for upgrading SocketStream. Regenerating assets to include the latest client code..."
      self.pack.js.lib()
      $SS.internal.saveState()
    
  
  _watchForChangesInDir: (dir, cb) ->
    fs.readdirSync(dir).map (file) ->
      path = "#{dir}/#{file}"
      fs.unwatchFile(path)
      fs.watchFile path, (curr, prev) ->
        if !curr or (Number(curr.mtime) > Number(prev.mtime))
          util.log("Change detected in #{path}. Recompiling client files...")
          cb()
  
  _deleteFilesInPublicDir: (rexexp) ->
    fs.readdirSync(self.public_path).map (file) -> fs.unlink("#{self.public_path}/#{file}") if file.match(rexexp)



