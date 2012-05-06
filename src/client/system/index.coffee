# System Assets
# -------------
# Loads system libraries and modules for the client. Also exposes an internal API 
# which other modules can use to send system assets to the client

fs = require('fs')
pathlib = require('path')
uglifyjs = require('uglify-js')
coffee = require('coffee-script') if process.env['SS_DEV']

wrap = require('../wrap')
fsUtils = require('../../utils/file')

# Allow internal modules to deliver assets to the browser
assets =
  libs:       []
  modules:    {}
  initCode:   []


# API to add new System Library or Module
exports.send = send = (type, name, content, options = {}) ->
  content = coffee.compile(content) if coffee && options.coffee
  switch type
    when 'code'
      assets.initCode.push(content)
    when 'lib', 'library'
      assets.libs.push({name: name, content: content, options: options})
    when 'mod', 'module'
      if assets.modules[name]
        throw new Error("System module name '#{name}' already exists")
      else
        assets.modules[name] = {content: content, options: options}


# Load all system libs and modules
exports.load = ->

  # Load essential libs for backwards compatibility with all browsers
  # and to enable module loading. Note with libs, order is important!
  ['json.min.js', 'browserify.js'].forEach (fileName) ->
    path = pathlib.join(__dirname, '/libs/' + fileName)
    code = fs.readFileSync(path, 'utf8')
    preMinified = fileName.indexOf('.min') >= 0
    send('lib', fileName, code, {minified: preMinified})

  # System Modules. Including main SocketStream client code
  # Load order is not important
  modDir = pathlib.join(__dirname, '/modules')
  fsUtils.readDirSync(modDir).files.forEach (fileName) ->
    code = fs.readFileSync(fileName, 'utf8')
    sp = fileName.split('.')
    extension = sp[sp.length-1]
    modName = fileName.substr(modDir.length + 1)
    send('mod', modName, code, {coffee: extension == 'coffee'})


# Serve system assets
exports.serve =

  js: (options = {}) ->
    # Libs
    output = assets.libs.map (code) ->
      options.compress && !code.options.minified && minifyJS(code.content) || code.content

    # Modules
    for name, mod of assets.modules
      code = wrap.module(name, mod.content)
      code = minifyJS(code) if options.compress && !mod.options.minified 
      output.push(code)

    output.join("\n")

  initCode: ->
    assets.initCode.join(" ")


# Private

minifyJS = (originalCode) ->
  jsp = uglifyjs.parser
  pro = uglifyjs.uglify
  ast = jsp.parse(originalCode)
  ast = pro.ast_mangle(ast)
  ast = pro.ast_squeeze(ast)
  pro.gen_code(ast) + ';'