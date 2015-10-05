// SocketStream 0.3
// ----------------
'use strict';

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

// logging
var log = require('./utils/log');

/**
 * @ngdoc overview
 * @name ss
 * @description
 * Internal API object which is passed to sub-modules and can be used within your app.
 * Use with caution.
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

  // loading http, client and ws
  load: load,
  unload: unload,

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
 * Internal API for loading bundler plugins.
 */
api.require = require('./utils/require')(api);

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
exports.events = api.events = new EventEmitter2();

// Session & Session Store
var session = exports.session = api.session = require('./session')(api);

// Publish Events
var publish = exports.publish = require('./publish')();

// HTTP
var http = exports.http = api.http = require('./http')(api);

// Client Asset Manager
var client = exports.client = require('./client')(api).init();

// Tasks for Orchestrator
var tasks = exports.tasks = require('./tasks')(api, http.router, client.options);

// This is an experimental API, expect changes
exports.task = api.task = tasks.add;
api.defaultTask = tasks.defaultTask;

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

/**
 * @ngdoc service
 * @name ss.server:server
 *
 * @description
 * Server parts used while running
 */
api.server = {};

function getServer() {
  if (api.server.responders == null) {
    api.server.responders = responders.load();
    api.server.eventTransport = publish.transport.load();

    // Extend the internal API with a publish object you can call from your own server-side code
    api.publish = publish.api(api.server.eventTransport);
  }
  return api.server;
}

// Incoming Request Responders
var responders = exports.responders = require('./request/index')(api);

// Websocket Layer (transport, message responders, transmit incoming events)
var ws = exports.ws = require('./websocket/index')(api);

// Only one instance of the server can be started at once
var serverInstance = null; //TODO enforce the one server instance in tasks

// In the future the server will just be a middleware to use
// Ensure server can only be started once
exports.start = function() {
  return serverInstance || (serverInstance = start.apply(null,arguments));
};

exports.stream = api.stream = stream;

function stream(httpServer) {
  api.log.info('Starting SocketStream %s in %s mode...'.green, version, env);
  var server = getServer();
  server.httpServer = httpServer;

  // Bind responders to websocket
  ws.load(server.httpServer, server.responders, server.eventTransport, api.session.options);
}

var loaded = false;

function load() {
  if (!loaded) {

    // load addon modules
    api.require.forEach(['socketstream-*','socketstream.*'],function(mod) {
      if (typeof mod === 'function') {
        mod(api);
      }
    });

    // Append SocketStream middleware to stack
    http.load(client.options.dirs['static'], client.options.dirs['assets'], session.store.get(), session.options);

    // Load Client Asset Manager
    client.load();
  }
}

function unload() {
  loaded = false;

  tasks.unload();
  client.unload();
  client.assets.unload();
  http.unload();
  ws.unload();
}

var exitRegistered;

/**
 * @ngdoc function
 * @name start
 * @param {HTTPServer} server Instance of the server from the http module
 * @description
 * Starts the development or production server
 */
function start() {

  var plan = tasks.plan(arguments);

  // Hook in streaming if called with HTTP server
  if (plan.httpServer) {
    stream(plan.httpServer);
  }

  tasks.defaults();

  tasks.start(plan.targets,plan.callback);

  if (!exitRegistered) {
    process.on('exit', api.unload);
    exitRegistered = true;
  }

  return api;
}
