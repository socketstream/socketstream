// SocketStream 0.3
// ----------------
'use strict';

// console.log('CHECK');
// console.log(process.env);
// console.log('/CHECK');

require('colors');

var EventEmitter2 = require('eventemitter2').EventEmitter2;

/*
 * @ngdoc overview
 * @name socketstream
 * @description
 * Public Module for Socketstream
 */

// Get current version from package.json
var version = exports.version = require('./utils/file').loadPackageJSON().version;

// Set root path of your project
var root = exports.root = process.cwd().replace(/\\/g, '/'); // replace '\' with '/' to support Windows

// Warn if attempting to start without a cwd (e.g. through upstart script)
if (root === '/') {
  throw new Error('You must change into the project directory before starting your SocketStream app');
}

// Set environment
// console.log("SS ENV IS ", process.env['SS_ENV']);

var env = exports.env = (process.env['NODE_ENV'] || process.env['SS_ENV'] || 'development').toLowerCase();

// Session & Session Store
var session = exports.session = require('./session');

// logging
var log = require('./utils/log');

/**
 * @ngdoc overview
 * @name ss
 * @description
 * Internal API object which is passed to sub-modules and can be used within your app
 *
 * To access it without it being passed `var ss = require('socketstream').api;`
 *
 * @type {{version: *, root: *, env: string, log: (*|exports), session: exports, add: Function}}
 */
var api = exports.api = {

  /**
   * @ngdoc property
   * @name ss.version
   * @returns {number} major.minor
   */
  version: version,
  /**
   * @ngdoc property
   * @name ss.root
   * @description
   * By default the project root is the current working directory
   * @returns {string} Project root
   */
  root: root,
  /**
   * @ngdoc property
   * @name ss.env
   * @returns {string} Execution environment type. To change set environment variable `NODE_ENV` or `SS_ENV`. 'development' by default.
   */
  env: env,

  log: log,
  session: session,

  /**
   * @ngdoc function
   * @name ss.add
   * @param {string} name - Key in the `ss` API.
   * @param {function|number|boolean|string} fn - value or function
   * @description
   * Call from your app to safely extend the 'ss' internal API object passed through to your /server code
   */
  add: function(name, fn) {
    if (api[name]) {
      throw new Error('Unable to register internal API extension \'' + name + '\' as this name has already been taken');
    } else {
      api[name] = fn;
      return true;
    }
  }
};

/**
 * @ngdoc service
 * @name events
 * @description
 * Internal Event bus.
 *
 * Note: only used by the ss-console module for now. This idea will be expended upon in SocketStream 0.4
 *
 * 'server:start' is emitted when the server starts. If in production the assets will be saved before the event.
 */
var events = exports.events = new EventEmitter2();

// Publish Events
var publish = exports.publish = require('./publish/index')();

// HTTP
var http = exports.http = require('./http/index')(root);

// Client Asset Manager
var client = exports.client = require('./client/index')(api, http.router);


/**
 * @ngdoc service
 * @name ss.client:client
 * @function
 *
 * @description
 * Allow other libs to send assets to the client
 */
//
api.client = {send: client.assets.send, dirs: client.dirs};

// Incoming Request Responders
var responders = exports.responders = require('./request/index')(api);

// Websocket Layer (transport, message responders, transmit incoming events)
var ws = exports.ws = require('./websocket/index')(api, responders);

// Only one instance of the server can be started at once
var serverInstance = null;

/**
 * @ngdoc function
 * @name start
 * @param {HTTPServer} server Instance of the server from the http module
 * @description
 * Starts the development or production server
 */
function start(httpServer) {

  // Load SocketStream server instance
  var server = {
      responders:      responders.load(),
      eventTransport:  publish.transport.load(),
      sessionStore:    session.store.get()
    };

  // Extend the internal API with a publish object you can call from your own server-side code
  api.publish = publish.api(server.eventTransport);

  // Start web stack
  if (httpServer) {

    api.log.info('Starting SocketStream %s in %s mode...'.green, version, env);

    // Bind responders to websocket
    ws.load(httpServer, server.responders, server.eventTransport);

    // Append SocketStream middleware to stack
    http.load(client.options.dirs['static'], client.options.dirs['assets'], server.sessionStore, session.options);

    // Load Client Asset Manager
    client.load();

    // Send server instance to any registered modules (e.g. console)
    events.emit('server:start', server);

    process.on('exit', function() {
      events.emit('server:stop', server);
      client.unload();
      http.unload();
      ws.unload();
    });

  // If no HTTP server is passed return an API to allow for server-side testing
  // Note this feature is currently considered 'experimental' and the implementation will
  // be changed in SocketStream 0.4 to ensure any type of Request Responder can be tested
  } else {
    var sessionID = session.create();

    // jshint loopfunc:true
    for (var id in server.responders) {
      if (server.responders.hasOwnProperty(id)) {
        var responder = server.responders[id];

        if (responder.name && responder.interfaces.internal) {
          var fn = function(){
            var args = Array.prototype.slice.call(arguments),
                cb = args.pop();

            return responder.interfaces.internal(args, {sessionId: sessionID, transport: 'test'}, function(err, params){ cb(params); });
          };
          api.add(responder.name, fn);
        }
      }
    }

  }

  return api;
}

// Ensure server can only be started once
exports.start = function(httpServer) {
  return serverInstance || (serverInstance = start(httpServer));
};
