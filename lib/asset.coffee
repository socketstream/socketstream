EventEmitter = require('events').EventEmitter
emitter = new EventEmitter

self = {}
class exports.Asset

  public_path: './public/assets'
  system_path: __dirname + '/client'

  watch_dirs: [
    ['./app/views', 'html', 'app', -> self.watch()],
    ['./lib/client', 'js', 'lib'],
    ['./lib/css', 'css', 'lib'],
    ["#{__dirname}/client/js", 'js', 'system'],
  ]

  constructor: (@options = {}) ->
    self = @
    @files = {js: {}, css: {}}
    
  init: ->
    @_findAssets => @_ensureAssetsExist()
  
  developerMode: ->
    self.pack.html.app ->
      self.watch()
      emitter.on 'regenerate_html', ->
        self.pack.html.app ->
          self.watch()
  
  watch: ->
    self.timestamp = Date.now()
    sys.log 'Watching client files for changes...'
    @watch_dirs.map (asset) ->
      self._watchForChangesInDir(asset[0], -> self.output[asset[1]][asset[2]]())


  # Live Request Server - Compiles and serves assets live in development mode (or whenever $SS.config.pack_assets != true)
  request:

    valid: (url) ->
      #return true if url == '/'
      responds_to = ['coffee', 'styl']
      file_extension = url.split('.').reverse()[0]
      responds_to.include(file_extension)
    
    serve: (request, response) ->
      #return @jade('app.jade',cb) if url == '/'
      file_name = request.url.split('/')[2]
      file_extension = request.url.split('.').reverse()[0]
      self.compile[file_extension] file_name, (result) ->
        response.writeHead(200, {'Content-type': result.content_type, 'Content-Length': result.output.length})
        response.end(result.output)


  # Asset Compiler - Transforms lovely languages into ancient text
  compile:

    jade: (input_file_name, locals, cb) ->
      file = "#{$SS.root}/app/views/#{input_file_name}"
      $SS.libs.jade.renderFile file, {locals: {SocketStream: locals}}, (err, html) ->
        cb {output: html, content_type: 'text/html'}

    coffee: (input_file_name, cb) ->
      input = fs.readFileSync "#{$SS.root}/app/client/#{input_file_name}", 'utf8'
      try
        js = $SS.libs.coffee.compile(input)
        cb {output: js, content_type: 'text/javascript'}
      catch e
        sys.log("\x1B[1;31mError: Unable to compile Coffeescript file #{input_file_name} to JS\x1B[0m")
        throw(e) if $SS.config.throw_errors

    styl: (input_file_name, cb)  ->
      source_path = "#{$SS.root}/app/css"
      input = fs.readFileSync "#{source_path}/#{input_file_name}", 'utf8'
      $SS.libs.stylus.render input, { filename: input_file_name, paths: [source_path], compress: $SS.config.pack_assets}, (err, css) ->
        if err
          sys.log("\x1B[1;31mError: Unable to compile Stylus file #{input_file_name} to CSS\x1B[0m")
          throw(err)
        cb {output: css, content_type: 'text/css'}


  # Asset Packer - Pre-concatenates/compiles/minifies files in advance to be served by the node static server
  pack:
    
    all: ->
      sys.log "Pre-packing all client assets..."
      @js.lib()
      @js.app()
      @css.lib()
      @css.app()
      @html.app()
    
    html:
      
      app: (cb = ->) ->
        self.inclusions = []
        self.inclusions.push(self.tag.js('assets', self.files.js.lib))
        self.inclusions.push(self.tag.css('assets', self.files.css.lib))
        
        if $SS.config.pack_assets
          self.inclusions.push(self.tag.js('assets', self.files.js.app))
          self.inclusions.push(self.tag.css('assets', self.files.css.app))
        else
          self._fileList './app/client', 'app.coffee', (files) => files.map (file) => self.inclusions.push(self.tag.js('dev', file))
          self.inclusions.push(self.tag.css('dev', 'app.styl'))
        
        self.inclusions.push('<script type="text/javascript">$(document).ready(function() { app = new App(); app.init(); });</script>')
        
        self._buildTemplates()
        
        self.compile.jade 'app.jade', self.inclusions.join(''), (result) ->
          fs.writeFileSync './public/index.html', result.output
          sys.log('Compiled app.jade to index.html')
          cb()
    
    js:
      
      app: ->
        source_path = './app/client'
        source_file_name = 'app.coffee'
        self._fileList source_path, source_file_name, (files) =>
          output = []
          files.map (file_name) ->
            sys.log('  Compiling and adding ' + file_name)
            self.compile.coffee file_name, (result) ->
              output.push(result.output)
          final_output = output.join("\n")
          final_output = self._minifyJS(source_file_name, final_output)

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
        self._deleteFilesInPublicDir(/^app.*css$/)
        self.files.css.app = "app_#{Date.now()}.css"
        self.compile.styl 'app.styl', (result) ->
          fs.writeFile("#{self.public_path}/#{self.files.css.app}", result.output)
          sys.log('Stylus files compiled into CSS')
          emitter.emit('regenerate_html')
        
      lib: ->
        self._deleteFilesInPublicDir(/^lib.*css$/)
        output = self._concatFiles("./lib/css")
        self.files.css.lib = "lib_#{Date.now()}.css"
        fs.writeFile("#{self.public_path}/#{self.files.css.lib}", output)
        sys.log('CSS libs concatenated')
        emitter.emit('regenerate_html')

  # Helpers to generate HTML tags
  tag:

    css: (path, name) ->
      '<link href="/' + path + '/' + name + '" media="screen" rel="stylesheet" type="text/css">'
      
    js: (path, name) ->
      '<script src="/' + path + '/' + name + '" type="text/javascript"></script>'
    
    template: (id, contents) ->
      '<script id="' + id + '" type="text/html">' + contents + '</script>'

  
  # Private helper methods

  _findAssets: (cb) ->
    @_fileList self.public_path, null, (files) =>
      files.filter((file) -> file.match(/(css|js)$/)).map (file) ->
        file_arr = file.split('.')
        ext = file_arr[file_arr.length - 1]
        type = file_arr[0].substring(0,3)
        f = self.files[ext]
        f[type] = file
      cb()
 
  _ensureAssetsExist: ->
    unless self.files.js.lib? and self.files.css.lib? and self.files.css.app?
      sys.log "It looks like this is the first time you're running SocketStream. Generating asset files..."
      self.pack.all()
  
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
    files = fs.readdirSync(path).sort().filter((file) -> !file.match(/(^_|^\.)/))
    if first_file
      files = files.delete(first_file)
      files.unshift(first_file) 
    cb(files)

  _concatFiles: (path) ->
    self._fileList path, null, (files) ->
      files.sort().map (file_name) ->
        sys.log "  Concatenating file #{file_name}"
        output = fs.readFileSync("#{path}/#{file_name}", 'utf8')
        output = self._minifyJS(file_name, output) if file_name.match(/\.(coffee|js)/) and !file_name.match(/\.min/)
        output
      .join("\n")

  _minifyJS: (file_name, orig_code) ->
    formatKb = (size) -> "#{Math.round(size * 1000) / 1000} KB"
    orig_size = (orig_code.length / 1024)
    jsp = $SS.libs.uglifyjs.parser
    pro = $SS.libs.uglifyjs.uglify
    ast = jsp.parse(orig_code)
    ast = pro.ast_mangle(ast)
    ast = pro.ast_squeeze(ast)
    minified = pro.gen_code(ast)
    min_size = (minified.length / 1024)
    sys.log("  Minified #{file_name} from #{formatKb(orig_size)} to #{formatKb(min_size)}")
    minified + ';' # Ensures all scripts are correctly terminated

  _buildTemplates: ->
    self._fileList './app/views', null, (files) ->
      files.filter((file) -> !file.match(/\.jade$/)).map (dir) ->
        self._fileList "./app/views/#{dir}", null, (templates) ->
          self.inclusions.push(self._buildTemplate(dir + '/' + template_name)) for template_name in templates
    
  _buildTemplate: (template_path) ->
    path = template_path.split('/').join('-')
    ext = path.split('.').reverse()[0]
    id = path.replace('.' + ext, '')
    file = fs.readFileSync('./app/views/' + template_path, 'utf8')
    try
      html = $SS.libs.jade.render(file);
    catch e
      console.error 'Unable to render jade template: ' + template_path
      throw e
    self.tag.template(id, html)
    
