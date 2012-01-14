# SocketStream Browser Client Code
# --------------------------------
# Generates custom code to be sent and run on the browser.
# The SocketStream client does not depend upon jQuery or any other external library.
# The client needs to know which websocket transport and server-side responders you're loading
# so all the client-side code can be sent

fs = require('fs')
coffee = require('coffee-script') if process.env['SS_DEV']

exports.init = (transport, responders) ->

  html: (cb) ->
    output = []

    if transport.client().html?
      output.push transport.client().html()
    
    cb output.join('\n')
    

  code: (cb) ->

    output = []

    # Load essential libs for compatibility with all browsers
    ['json.min.js','console_log.min.js', 'event_emitter.js'].forEach (file) ->
      output.push fs.readFileSync(__dirname + '/libs/' + file, 'utf8')

    # Load main client
    ext = coffee? && 'coffee' || 'js'
    input = fs.readFileSync(__dirname + '/init.' + ext, 'utf8')
    output.push coffee? && coffee.compile(input) || input

    # Next load the code we need for the selected websocket transport
    if transport.client().code?
      output.push transport.client().code()

    # Load client-code for active message responders
    responders.forEach (responder) ->
      output.push responder.client.code()

    # Finally assign client-side API window.ss and connect to server
    output.push """
    window.ss = window.SocketStream.apis;
    SocketStream.transport.connect();

    """
    
    # Output final JS for the browser
    cb output.join("\n")

