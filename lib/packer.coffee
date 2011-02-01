EventEmitter = require('events').EventEmitter
emitter = new EventEmitter

jade = require('jade@0.6.0')
stylus = require('stylus@0.0.2')
uglifyjs = require("uglify-js@0.0.3")
self = {}

class exports.Packer

  assets:      []
  public_path: './public/assets'
  system_path: __dirname + '/client'

  watch_dirs: [
    ['./app/views', 'html', 'app', -> self.watch()],
    ['./app/css', 'css', 'app'],
    ['./lib/client', 'js', 'lib'],
    ['./lib/css', 'css', 'lib'],
    ["#{__dirname}/client/js", 'js', 'system'],
  ]

  constructor: (@options = {}) ->
    self = @
    @files = {js: {}, css: {}}
    @_findAssets()
  
  developerMode: ->
    self.output.html.app ->
      self.watch()
      emitter.on 'regenerate_html', ->
        self.output.html.app ->
          self.watch()
  
  watch: ->
    self.timestamp = Date.now()
    sys.log 'Watching client files for changes...'
    @watch_dirs.map (asset) ->
      self._watchForChangesInDir(asset[0], -> self.output[asset[1]][asset[2]]())
    
  pack: ->
    @output.js.lib()
    @output.js.app()
    @output.css.lib()
    @output.css.app()
    @output.html.app()


  output:
    
    html:
      
      app: (cb = ->) ->
        self.assets = []
        self.assets.push(self.tag.js('assets', self.files.js.lib))
        self.assets.push(self.tag.css('assets', self.files.css.lib))
        self.assets.push(self.tag.css('assets', self.files.css.app))

        if NODE_ENV == 'development'
          self._fileList './app/client', 'app.coffee', (files) => files.map (file) => self.assets.push(self.tag.js('dev', file))
        else
          self.assets.push(self.tag.js('assets', self.files.js.app))
        
        self.assets.push('<script type="text/javascript">$(document).ready(function() { app = new App(); app.init(); });</script>')
        jade.renderFile './app/views/app.jade', {locals: {SocketStream: self.assets.join('')}}, (err, html) ->
          fs.writeFileSync './public/index.html', html
          sys.log('Compiled app.jade to index.html')
          cb()
    
    js:
      
      app: ->
        source_path = './app/client'
        self._fileList source_path, 'app.coffee', (files) =>
          output = []
          files.map (file) ->
            sys.log('  Compiling and adding ' + file)
            coffeescript = fs.readFileSync("#{source_path}/#{file}", 'utf8')
            try
              output.push(coffee.compile(coffeescript))
            catch e
              sys.log("\x1B[1;31mUnable to compile coffeescript #{file} to JS: #{e.message}\x1b[0m")
          final_output = output.join("\n")
          final_output = self._minifyJS(final_output)

          self._deleteFilesInPublicDir(/^app.*js$/)
          self.files.js.app = "app_#{Date.now()}.js"
          fs.writeFileSync("#{self.public_path}/#{self.files.js.app}", final_output)
          emitter.emit('regenerate_html')
        
      lib: ->
        self._deleteFilesInPublicDir(/^lib.*js$/)
        self.files.js.lib = "lib_#{Date.now()}.js"
        output = self._concatFiles('./lib/client')
        sys.log("  Appending SocketStream client files...")
        output += fs.readFileSync("#{self.system_path}/cached/lib.min.js", 'utf8')
        fs.writeFile("#{self.public_path}/#{self.files.js.lib}", output)
        emitter.emit('regenerate_html')
      
      system: ->
        output = self._concatFiles("#{self.system_path}/js")
        fs.writeFileSync("#{self.system_path}/cached/lib.min.js", output)
        sys.log("SocketStream client files updated")
        self.output.js.lib()
      
    css:
      
      app: ->
        source_path = './app/css'
        source_file = 'app.styl' # @import all additional files from this one
        self._deleteFilesInPublicDir(/^app.*css$/)
        self.files.css.app = "app_#{Date.now()}.css"
        input = fs.readFileSync("#{source_path}/#{source_file}", 'utf8')
        compress = if NODE_ENV == 'development' then false else true
        stylus.render input, { filename: source_file, paths: [source_path], compress: compress}, (err, output) ->
          throw err if (err)
          fs.writeFile("#{self.public_path}/#{self.files.css.app}", output)
          sys.log('Stylus files compliled into CSS')
          emitter.emit('regenerate_html')
        
      lib: ->
        self._deleteFilesInPublicDir(/^lib.*css$/)
        output = self._concatFiles("./lib/css")
        self.files.css.lib = "lib_#{Date.now()}.css"
        fs.writeFile("#{self.public_path}/#{self.files.css.lib}", output)
        sys.log('CSS libs concatinated')
        emitter.emit('regenerate_html')


  tag:

    css: (path, name) ->
      '<link href="/' + path + '/' + name + '" media="screen" rel="stylesheet" type="text/css">'
      
    js: (path, name) ->
      '<script src="/' + path + '/' + name + '" type="text/javascript"></script>'


  _findAssets: ->
    @_fileList self.public_path, null, (files) =>
      files.filter((file) -> file.match(/(css|js)$/)).map (file) ->
        file_arr = file.split('.')
        ext = file_arr[file_arr.length - 1]
        type = file_arr[0].substring(0,3)
        f = self.files[ext]
        f[type] = file
  
  _watchForChangesInDir: (dir, cb) ->
    fs.readdirSync(dir).map (file) ->
      path = "#{dir}/#{file}"
      fs.unwatchFile(path)
      fs.watchFile path, (curr, prev) ->
        if !curr or (Number(curr.mtime) > Number(prev.mtime))
          sys.log("Change detected in #{path}. Recompiling client files...")
          cb()
  
  _deleteFilesInPublicDir: (rexexp) ->
    fs.readdirSync(self.public_path).map (file) -> fs.unlink("#{self.public_path}/#{file}") if file.match(rexexp)
  
  _fileList: (path, first_file, cb) ->
    files = fs.readdirSync(path).filter((file) -> !file.match(/(^_|^\.)/))
    if first_file
      files = files.delete(first_file)
      files.unshift(first_file) 
    cb(files)

  _concatFiles: (path) ->
    self._fileList path, null, (files) ->
      files.sort().map (file) ->
        sys.log "  Concatinating file #{file}"
        output = fs.readFileSync("#{path}/#{file}", 'utf8')
        output = self._minifyJS(output) if file.match(/\.(coffee|js)/) and !file.match(/\.min/)
        output
      .join("\n")

  _minifyJS: (orig_code) ->
    orig_size = (orig_code.length / 1024)
    jsp = uglifyjs.parser
    pro = uglifyjs.uglify
    ast = jsp.parse(orig_code)
    ast = pro.ast_mangle(ast)
    ast = pro.ast_squeeze(ast)
    minified = pro.gen_code(ast)
    min_size = (minified.length / 1024)
    sys.log("  Minified from #{orig_size} KB to #{min_size} KB")
    minified + ';' # Ensures all scripts are correctly terminated
    
  
