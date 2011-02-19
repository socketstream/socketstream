fs = require("fs")
util = require("util")

EventEmitter = require('events').EventEmitter
emitter = new EventEmitter

self = {}
class exports.Asset

  public_path: './public/assets'
  system_path: __dirname + '/client'
  client_dirs: ['client', 'shared']

  watch_dirs: [
    ['./lib/client', 'js', 'lib'],
    ['./lib/css', 'css', 'lib'],
    ["#{__dirname}/client/js", 'js', 'system'],
    ["#{__dirname}/client", 'js', 'system'],
  ]

  constructor: (@options = {}) ->
    self = @
    @files = {js: {}, css: {}}
    
  init: ->
    @_findAssets => @_ensureAssetsExist()
  
  monitor: ->
    emitter.on 'regenerate_html', ->
      self.pack.html.app -> self.watch()
    self.watch()
  
  watch: ->
    self.timestamp = Date.now()
    @watch_dirs.map (asset) ->
      self._watchForChangesInDir(asset[0], -> self.pack[asset[1]][asset[2]]())


  # Live Request Server - Compiles and serves assets live in development mode (or whenever $SS.config.pack_assets != true)
  request:
    
    responds_to:  ['coffee', 'styl']

    valid: (url) ->
      return true if @_root(url)
      file_extension = url.split('.').reverse()[0]
      @responds_to.include(file_extension)
    
    serve: (request, response) ->
      file = @_parseURL(request.url)
      request.ss_benchmark_start = new Date
      self.compile[file.extension] file.name, (result) ->
        response.writeHead(200, {'Content-type': result.content_type, 'Content-Length': result.output.length})
        response.end(result.output)
        benchmark_result = (new Date) - request.ss_benchmark_start
        util.log("DEV INFO: Compiled and served #{file.name} in #{benchmark_result}ms")
    
    _parseURL: (url) ->
      extension = url.split('.').reverse()[0]
      path = url.split('/')
      dir = path[1]; file = path[2]
      if @_root(url)
        {name: 'app.jade', extension: 'jade'}
      else if extension == 'coffee' and self.client_dirs.include(dir)
        {name: "#{dir}/#{file}", extension: extension}
      else
        {name: file, extension: extension}

    # Determins if we're looking for the root of the site, ignoring any hashes or anything in the query string
    _root: (url) ->
       u = url.split('?')[0].split('/')
       u.length == 2 and !u[1].match(/\./)


  # Asset Compiler - Transforms lovely languages into ancient text
  compile:

    jade: (input_file_name, cb) ->
      file = "#{$SS.root}/app/views/#{input_file_name}"
      
      # Always include links to JS and CSS client-side pre-packed libraries
      inclusions = []
      inclusions.push(self.tag.js('assets', self.files.js.lib))
      inclusions.push(self.tag.css('assets', self.files.css.lib))
      
      # Typically when in Staging or Production assets are pre-packed, so we include links to them here
      if $SS.config.pack_assets
        inclusions.push(self.tag.js('assets', self.files.js.app))
        inclusions.push(self.tag.css('assets', self.files.css.app))
      # However, when in Development, we need to iterate through all dirs and include separate links to load each file
      else
        # Include client-side and shared CoffeeScript
        self.client_dirs.map (dir) ->
          files = fileList "./app/#{dir}", 'app.coffee'
          files.map (file) -> inclusions.push(self.tag.js(dir, file))
        # Include Stylus files (additional files should be linked from app.styl)
        inclusions.push(self.tag.css('css', 'app.styl'))
      
      # Include all jQuery templates, if present
      inclusions = inclusions.concat(@_buildTemplates())
      
      # Add code to call app.init() in client (this will be called as soon as SocketStream is ready)
      inclusions.push('<script type="text/javascript">$(document).ready(function() { app = new App(); app.init(); });</script>')
      
      $SS.libs.jade.renderFile file, {locals: {SocketStream: inclusions.join('')}}, (err, html) ->
        cb {output: html, content_type: 'text/html'}

    coffee: (input_file_name, cb) ->
      path = "app/#{input_file_name}"
      input = fs.readFileSync "#{$SS.root}/#{path}", 'utf8'
      try
        js = $SS.libs.coffee.compile(input)
        cb {output: js, content_type: 'text/javascript'}
      catch e
        util.log("\x1B[1;31mError: Unable to compile Coffeescript file #{path} to JS\x1B[0m")
        throw(e) if $SS.config.throw_errors

    styl: (input_file_name, cb) ->
      dir = "app/css"
      path = "#{dir}/#{input_file_name}"
      input = fs.readFileSync "#{$SS.root}/#{path}", 'utf8'
      $SS.libs.stylus.render input, { filename: input_file_name, paths: [dir], compress: $SS.config.pack_assets}, (err, css) ->
        if err
          util.log("\x1B[1;31mError: Unable to compile Stylus file #{path} to CSS\x1B[0m")
          throw(err) if $SS.config.throw_errors
        cb {output: css, content_type: 'text/css'}

    _buildTemplates: ->
      output = []
      files = fileList './app/views'
      files.filter((file) -> !file.match(/\.jade$/)).map (dir) =>
        templates = fileList "./app/views/#{dir}"
        templates.map (template_name) =>
          output.push(@_buildTemplate(dir + '/' + template_name))
      output

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


  # Asset Packer - Pre-concatenates/compiles/minifies files in advance to be served by the node static server
  pack:
    
    all: ->
      util.log "Pre-packing all client assets..."
      @js.lib()
      @js.app()
      @css.lib()
      @css.app()
      @html.app()
    
    html:
      
      app: (cb = ->) ->        
        self.compile.jade 'app.jade', (result) ->
          fs.writeFileSync './public/index.html', result.output
          util.log('Compiled app.jade to index.html')
          cb()
    
    js:
      
      app: ->
        source_file_name = 'app.coffee'
        output = []

        self.client_dirs.map (dir) ->
          source_path = "./app/#{dir}"
          files = fileList source_path, source_file_name
          files.map (file_name) ->
            full_file_name = dir + '/' + file_name
            util.log('  Compiling and adding ' + full_file_name)
            self.compile.coffee full_file_name, (result) -> output.push(result.output)
        final_output = output.join("\n")
        final_output = minifyJS(source_file_name, final_output)

        self._deleteFilesInPublicDir(/^app.*js$/)
        self.files.js.app = "app_#{Date.now()}.js"
        fs.writeFileSync("#{self.public_path}/#{self.files.js.app}", final_output)
        
      lib: ->
        self._deleteFilesInPublicDir(/^lib.*js$/)
        self.files.js.lib = "lib_#{Date.now()}.js"
        output = concatFiles('./lib/client')
        util.log("  Appending SocketStream client files...")
        output += fs.readFileSync("#{self.system_path}/cached/lib.min.js", 'utf8')
        fs.writeFile("#{self.public_path}/#{self.files.js.lib}", output)
        emitter.emit('regenerate_html')
      
      system: ->
        client_file_path = "#{self.system_path}/socketstream.coffee"
        output = concatFiles("#{self.system_path}/js")
        client = fs.readFileSync client_file_path, 'utf8'
        try
          js = $SS.libs.coffee.compile(client)
          util.log("  Compiled SocketStream client into JS")
          output += minifyJS('client file', js)
        catch e
          $SS.sys.log.error(['unable_to_compile_client', "Error: Unable to compile SocketStream client file to JS"])
          throw(e)
        fs.writeFileSync("#{self.system_path}/cached/lib.min.js", output)
        util.log("SocketStream system client files updated. Recompiling application lib file to include new code...")
        self.pack.js.lib()
      
    css:
      
      app: ->
        self._deleteFilesInPublicDir(/^app.*css$/)
        self.files.css.app = "app_#{Date.now()}.css"
        self.compile.styl 'app.styl', (result) ->
          fs.writeFile("#{self.public_path}/#{self.files.css.app}", result.output)
          util.log('Stylus files compiled into CSS')
        
      lib: ->
        self._deleteFilesInPublicDir(/^lib.*css$/)
        output = concatFiles("./lib/css")
        self.files.css.lib = "lib_#{Date.now()}.css"
        fs.writeFile("#{self.public_path}/#{self.files.css.lib}", output)
        util.log('CSS libs concatenated')
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
    files = fileList self.public_path
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


# Util Helpers

fileList = (path, first_file = null) ->
  try
    files = fs.readdirSync(path).filter((file) -> !file.match(/(^_|^\.)/))
    if first_file and files.include(first_file)
      files = files.delete(first_file)
      files.unshift(first_file) 
    files.sort()
  catch e
    throw e unless e.code == 'ENOENT' # dir missing
    []

concatFiles = (path) ->
  files = fileList path
  files.map (file_name) ->
    util.log "  Concatenating file #{file_name}"
    output = fs.readFileSync("#{path}/#{file_name}", 'utf8')
    output = minifyJS(file_name, output) if file_name.match(/\.(coffee|js)/) and !file_name.match(/\.min/)
    output += ';' if file_name.match(/\.(js)/) # Ensures the file ends with a semicolon. Many libs don't and would otherwise break when concatenated
    output
  .join("\n")

minifyJS = (file_name, orig_code) ->
  formatKb = (size) -> "#{Math.round(size * 1000) / 1000} KB"
  orig_size = (orig_code.length / 1024)
  jsp = $SS.libs.uglifyjs.parser
  pro = $SS.libs.uglifyjs.uglify
  ast = jsp.parse(orig_code)
  ast = pro.ast_mangle(ast)
  ast = pro.ast_squeeze(ast)
  minified = pro.gen_code(ast)
  min_size = (minified.length / 1024)
  util.log("  Minified #{file_name} from #{formatKb(orig_size)} to #{formatKb(min_size)}")
  minified
