# SocketStream Browser Client Code
# --------------------------------
# Generates custom code to be sent and run on the browser.
# The SocketStream client does not depend upon jQuery or any other external library.
# The client needs to know which websocket transport and server-side responders you're loading
# so all the client-side code can be sent

fs = require('fs')
fsUtils = require('../utils/file')
coffee = require('coffee-script') if process.env['SS_DEV']

exports.init = (transport, responders) ->

  html: (cb) ->
    output = []

    if transport.client().html?
      output.push transport.client().html()
    
    cb output.join('\n')
    

  code: (cb) ->

    output = []

    # Load essential libs for backwards compatibility with all browsers
    ['json.min.js','console_log.min.js'].forEach (file) ->
      output.push fs.readFileSync(__dirname + '/libs/' + file, 'utf8')

    # Load Browserify code (handles 'require'ing of modules)
    output.push fs.readFileSync(__dirname + '/browserify.js', 'utf8')

    systemMods = {}

    # Send System Modules
    modDir = __dirname + '/system_modules'
    fsUtils.readDirSync(modDir).files.forEach (mod) ->
      input = fs.readFileSync(mod, 'utf8')
      sp = mod.split('.')
      ext = sp[sp.length-1]
      code = ext == 'coffee' && coffee? && coffee.compile(input) || input
      systemMods[mod.substr(modDir.length + 1)] = code

    # Next load the code we need for the selected websocket transport
    if transport.client().libs?
      output.push(transport.client().libs() + "\n")

    if transport.client().code?
      systemMods['socketstream-transport'] = transport.client().code()

    # Load client-code for active message responders
    for name, responder of responders
      systemMods['socketstream-' + name] = responder.client.code()

    for name, code of systemMods
      output.push("require.define(\"#{name}\", function (require, module, exports, __dirname, __filename){\n#{code} \n});")


    # Finally assign client-side API window.ss and connect to server
    for name, responder of responders
      output.push("require('socketstream-#{name}');")
   
    # Output final JS for the browser
    cb output.join("\n")

