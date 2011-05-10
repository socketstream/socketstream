# Asset Packer
# ------------
# Pre-concatenates/compiles/minifies files in advance to be served by the node static server

fs = require('fs')
util = require('util')

EventEmitter = require('events').EventEmitter
emitter = new EventEmitter

utils = require('./utils.coffee')
file_utils = require('../utils/file')

# Define where the SocketStream client files live
system_path = __dirname + '/../client'

exports.init = (@assets) ->
  @

exports.pack =
  
  all: ->
    util.log "Pre-packing all client assets..."
    @js.lib()
    @js.app()
    @css.lib()
    @css.app()
    @html.app()
  
  html:
    
    app: (cb = ->) ->        
      exports.assets.compile.jade 'app.jade', (result) ->
        fs.writeFileSync './public/index.html', result.output
        util.log('Compiled app.jade to index.html')
        cb()
  
  js:
    
    app: ->
      first_file = 'app/client/app.coffee'
      output = []

      exports.assets.client_dirs.map (dir) ->
        path = "./app/#{dir}"
        files = file_utils.readDirSync(path).files
        files = utils.ensureCorrectOrder(files)
        files.map (file) ->
          util.log('  Compiling and adding ' + file)
          exports.assets.compile.coffee file, (result) -> output.push(result.output)
      final_output = output.join("\n")
      final_output = utils.minifyJS(first_file, final_output)

      deleteFilesInPublicDir(/^app.*js$/)
      exports.assets.files.js.app = "app_#{Date.now()}.js"
      fs.writeFileSync("#{exports.assets.public_path}/#{exports.assets.files.js.app}", final_output)
      
    lib: ->
      deleteFilesInPublicDir(/^lib.*js$/)
      exports.assets.files.js.lib = "lib_#{Date.now()}.js"
      output = utils.concatFiles('./lib/client')
      util.log("  Appending SocketStream client files...")
      output += fs.readFileSync("#{system_path}/cached/lib.min.js", 'utf8')
      fs.writeFile("#{exports.assets.public_path}/#{exports.assets.files.js.lib}", output)
      emitter.emit('regenerate_html')
    
    system: ->
      client_file_path = "#{system_path}/socketstream.coffee"
      output = utils.concatFiles("#{system_path}/js")
      client = fs.readFileSync client_file_path, 'utf8'
      try
        js = $SS.libs.coffee.compile(client)
        util.log("  Compiled SocketStream client into JS")
        output += utils.minifyJS('client file', js)
        fs.writeFileSync("#{system_path}/cached/lib.min.js", output)
      catch e
        $SS.log.error.exception(['unable_to_compile_client', "Error: Unable to compile or save the SocketStream client file to JS"])
        throw(e)
      util.log("SocketStream system client files updated. Recompiling application lib file to include new code...")
      exports.assets.pack.js.lib()
    
  css:
    
    app: ->
      deleteFilesInPublicDir(/^app.*css$/)
      exports.assets.files.css.app = "app_#{Date.now()}.css"
      exports.assets.compile.styl 'app.styl', (result) ->
        fs.writeFile("#{exports.assets.public_path}/#{exports.assets.files.css.app}", result.output)
        util.log('Stylus files compiled into CSS')
      
    lib: ->
      deleteFilesInPublicDir(/^lib.*css$/)
      output = utils.concatFiles("./lib/css")
      exports.assets.files.css.lib = "lib_#{Date.now()}.css"
      fs.writeFile("#{exports.assets.public_path}/#{exports.assets.files.css.lib}", output)
      util.log('CSS libs concatenated')
      emitter.emit('regenerate_html')


# PRIVATE

deleteFilesInPublicDir = (rexexp) ->
  fs.readdirSync(exports.assets.public_path).map (file) ->
    fs.unlink("#{exports.assets.public_path}/#{file}") if file.match(rexexp)
