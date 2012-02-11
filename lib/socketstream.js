// SocketStream 0.3
// ----------------

require('colors');

// Get current version from package.json
var version = exports.version = require('./utils/file').loadPackageJSON().version;

// Set root path of your project
var root = exports.root = process.cwd().replace(/\\/g, '/'); // replace '\' with '/' to support Windows

// Warn if attempting to start without a cwd (e.g. through upstart script)
if (root == '/') throw new Error("You must change into the project directory before starting your SocketStream app")

// Set environment
var env = exports.env = (process.env['SS_ENV'] || 'development').toLowerCase();

// Create an internal API object which is passed to sub-modules and can be used within your app
var api = exports.api = {

  version: version,
  root: root,
  env: env,

  // Call ss.api.add('name_of_api', value_or_function) from your app to safely extend the 'ss' internal API object passed through to your /server code
  add: function(name, fn) {
    var exists = false;
    if (exists = api[name]) {
      throw new Error("Unable to register internal API extension '#{name}'' as this name has already been taken");
    } else {
      api[name] = fn;
    }
  }
}

// Make sure nothing kills the server
//process.on('uncaughtException', function (err) { console.error('Exception caught: ', err)})

// Publish Events
var publish = exports.publish = require('./publish/index').init();

// Session & Session Store
var session = exports.session = require('./session');

// HTTP
var http = exports.http = require('./http/index').init(root);

// Client Asset Manager
var client = exports.client = require('./client_asset_manager/index').init(root, http.router, http.staticDirs);

// Websocket Layer (transport, message responders, publish)
var ws = exports.ws = require('./websocket/index').init(root, api);

// When server starts
exports.start = function(httpServer) {

  console.log('Starting SocketStream %s in %s mode...'.green, version, env);

  // Load Publisher Event transport (sends events internally or over redis to all listening nodes)
  eventTransport = publish.transport.load();
  
  // Extend the internal API with a publish object you can call from your own /server code
  api.add('publish', publish.api(eventTransport));

  // If web server is supplied (i.e. not console)
  if (httpServer) {

    // Append SocketStream middleware to stack
    var app = http.load(session.store.get(), session.options);

    // Load websocket transport (listens out for incoming events and delivers them to clients via websockets)
    var wsTransport = ws.transport.load(httpServer);

    // Load websocket responders
    var responders = ws.responders.load();

    // Load custom Browser Client Code
    var ssClient = require('./browser_client/index').init(wsTransport, responders);

    // Load Client Asset Manager
    client.load(ssClient);

    // Listen for incoming events
    require('./websocket/subscribe/index').init(eventTransport, wsTransport, ws.message);

  }
}

