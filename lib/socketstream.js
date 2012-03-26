// SocketStream 0.3
// ----------------

require('colors');

var EventEmitter2 = require('eventemitter2').EventEmitter2;

// Get current version from package.json
var version = exports.version = require('./utils/file').loadPackageJSON().version;

// Set root path of your project
var root = exports.root = process.cwd().replace(/\\/g, '/'); // replace '\' with '/' to support Windows

// Warn if attempting to start without a cwd (e.g. through upstart script)
if (root == '/') throw new Error("You must change into the project directory before starting your SocketStream app")

// Set environment
var env = exports.env = (process.env['SS_ENV'] || 'development').toLowerCase();

// Create internal Events bus
var events = exports.events = new EventEmitter2();

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
      return true;
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
var client = exports.client = require('./client/index').init(root, http.router, http.staticDirs);

// Request Handlers
var request = exports.request = require('./request/index').init(root, client, api);

// Websocket Layer (transport, message responders, transmit incoming events)
var ws = exports.ws = require('./websocket/index').init(client, request, api);

// When server starts
exports.start = function(httpServer) {

  console.log('Starting SocketStream %s in %s mode...'.green, version, env);

  // Load SocketStream server instance
  var server = {
    responders:      request.load(),
    eventTransport:  publish.transport.load(),
    sessionStore:    session.store.get()
  };

  // Extend the internal API with a publish object you can call from your own server-side code
  api.publish = publish.api(server.eventTransport);
 
  // Start web stack
  if (httpServer) {

    // Bind responders to websocket
    var wsTransport = ws.load(httpServer, server.responders, server.eventTransport);

    // Append SocketStream middleware to stack
    var app = http.load(server.sessionStore, session.options);

    // Load Client Asset Manager
    client.load(api);

  }

  // Send server instance to any registered modules (e.g. console)
  events.emit('server:start', server);

  return server;
}


