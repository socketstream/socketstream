# New App Generator
# -----------------
# Generates skeleton files needed to create a new SocketStream application

log = console.log

require('colors')
fs = require('fs')
path = require('path')
util = require('util')

dir_mode = '0755'

exports.generate = (program) ->
  name = program.args[1]
  clientFiles = {css: [], code: []}
  return log "Please provide a name for your application: $> socketstream new <MyAppName>" if name is undefined
  if makeRootDirectory(name)

    source = path.join(__dirname, '/../../new_project')
    codeExtension = program.coffee && 'coffee' || 'js'
    viewExtension = program.jade && 'jade' || 'html'

    cssExtension = 'css'
    if program.stylus
      cssExtension = 'styl'
    else if program.less
      cssExtension = 'less'

    selectedFormatters = []
    ['coffee', 'jade', 'less', 'stylus'].forEach (formatter) ->
      selectedFormatters.push(formatter) if program[formatter]

    # Define tools

    mkdir = (dir) ->
      fs.mkdirSync(path.join(name, dir), dir_mode)

    cp = (src, dest) ->
      destination = path.join(name, (dest || src))
      read = fs.createReadStream(path.join(source, src))
      write = fs.createWriteStream(destination)
      util.pump(read, write)

    write = (fileName, content) ->
      fs.writeFileSync(path.join(name, fileName), content, 'utf8')


    # Create essential directories
    mkdir('/client')
    mkdir('/client/code')
    mkdir('/client/code/app')
    mkdir('/client/code/libs')
    mkdir('/client/views')
    mkdir('/client/css')
    mkdir('/client/css/libs')
    mkdir('/client/templates')
    mkdir('/client/static')
    mkdir('/client/static/images')
    mkdir('/server')
    mkdir('/server/rpc')
    mkdir('/server/middleware')

    # Copy essential files
    cp('/.gitignore')
    cp('/.nodemonignore')
    cp('/README.md')
    cp('/client/static/favicon.ico')
    cp('/client/code/libs/jquery.min.js')
    cp("/client/code/app/entry.#{codeExtension}")
    clientFiles.code.push('libs/jquery.min.js')
    clientFiles.code.push('app')

    # Install chat demo files
    if program.minimal
      cp("/client/views/app.minimal.#{viewExtension}", "/client/views/app.#{viewExtension}")
      cp("/client/code/app/app.minimal.#{codeExtension}", "/client/code/app/app.#{codeExtension}")
      cp("/client/css/app.minimal.#{cssExtension}", "/client/css/app.#{cssExtension}")
      clientFiles.css.push("app.#{cssExtension}")
    else
      cp('/client/static/images/logo.png')
      cp("/client/code/app/app.demo.#{codeExtension}", "/client/code/app/app.#{codeExtension}")
      cp("/server/middleware/example.#{codeExtension}")
      cp("/server/rpc/demo.#{codeExtension}")
      cp('/client/css/libs/reset.css')
      cp("/client/css/app.demo.#{cssExtension}", "/client/css/app.#{cssExtension}")
      mkdir('/client/templates/chat')
      cp("/client/templates/chat/message.#{viewExtension}")
      cp("/client/views/app.demo.#{viewExtension}", "/client/views/app.#{viewExtension}")
      clientFiles.css.push('libs/reset.css')
      clientFiles.css.push("app.#{cssExtension}")

    # Generate app.js
    appjs = """
// My SocketStream 0.3 app

var http = require('http'),
    ss = require('socketstream');

function defaultHandler(err, port) {
  console.log('Listening on port ' + port);
}

exports.main = function(cb) {
  if (!cb)
    cb = defaultHandler;

  // Define a single-page client called 'main'
  ss.client.define('main', {
    view: 'app.#{viewExtension}',
    css:  ['#{clientFiles.css.join("', '")}'],
    code: ['#{clientFiles.code.join("', '")}'],
    tmpl: '*'
  });

  // Serve this client on the root URL
  ss.http.route('/', function(req, res){
    res.serveClient('main');
  });

"""

    # List any selected formatters
    appjs += "\n  // Code Formatters\n" if selectedFormatters.length > 0
    selectedFormatters.forEach (name) ->
      appjs += "  ss.client.formatters.add(require('ss-#{name}'));\n"
    if program.hogan
      appjs += "\n  // Use server-side compiled Hogan (Mustache) templates. Others engines available"
      appjs += "  ss.client.templateEngine.use(require('ss-hogan'));"
    appjs += """
REMOVEME

  // Minimize and pack assets if you type: SS_ENV=production node app.js
  if (ss.env === 'production') ss.client.packAssets();

  // Start web server
  var server = http.Server(ss.http.middleware);
  server.listen(0);

"""
    # Add the REPL if selected
    if program.repl
      appjs += """
REMOVEME
  // Start Console Server (REPL)
  // To install client: sudo npm install -g ss-console
  // To connect: ss-console <optional_host_or_port>
  var consoleServer = require('ss-console')(ss);
  consoleServer.listen(server.address().port + 1);

"""

    appjs += """
REMOVEME
  // Start SocketStream
  ss.start(server);

  // optionally notify parent if this is a forked process
  if (process.send) {
    process.send({
      'ss-server-port': server.address().port,
      'ss-console-port': server.address().port + 1
    });
  }

  // callback with port
  cb(null, server.address().port);
}

if (require.main === module) {
  exports.main();
}

"""
    # proper tabulation requires alignment marker
    # because Coffeescript strips leading whitespaces
    appjs = appjs.replace(/REMOVEME/g, '')
    write('/app.js', appjs)


    # Generate package.json
    pacakgejs = """
{
  "name": "#{name}",
  "description": "An awesome real time application",
  "version": "0.0.1",
  "author": "Me <me@mydomain.com>",
  "private": true,
  "engines": { "node": ">= 0.6.0" },
  "dependencies": {

"""
    pacakgejs += "    \"socketstream\": \"0.3.x\""
    mods = selectedFormatters.concat(['hogan'])
    mods.push('console') if program.repl
    mods.forEach (name, i) ->
      pacakgejs += ",\n    \"ss-#{name}\": \"0.1.x\""

    pacakgejs += "\n  }\n}"

    write('/package.json', pacakgejs)

    # Show finish text
    log "Success! Created app '#{name}' with:".yellow

    if program.minimal
      success("Minimal install (no demo)")
    else
      success("Basic chat demo", "(-m for minimal install)")

    if program.coffee
      success("CoffeeScript example code")
    else
      success("Javascript example code", "(-c if you prefer CoffeeScript)")

    if program.jade
      success("Jade for views")
    else
      success("Plain HTML for views", "(-j if you prefer Jade)")

     if program.stylus
       success("Stylus for CSS")
     else if program.less
       success("Less for CSS")
     else
       success("Plain CSS", "(-s if you prefer Stylus, -l for Less)")

    if program.hogan
      success("Hogan template engine")
    else
      success("No template engine (-h if you prefer Hogan)")

    if program.repl
      success("Console Server / REPL")

    log "Next, run the following commands:".yellow
    log "   cd " + name
    log "   [sudo] npm install"
    log "To start your app:".yellow
    log "   node app.js"


# Private

success = (name, alternative) ->
  log(" ✓".green, name, (alternative || '').grey)

makeRootDirectory = (name) ->
  try
    fs.mkdirSync(name, dir_mode) # Create the root directory
    return true
  catch e
    if e.code == 'EEXIST'
      log "Sorry the '#{name}' directory already exists. Please choose another name for your app."
      return false
    else
      throw e



