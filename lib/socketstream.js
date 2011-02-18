// SocketStream Boot File

var fs = require("fs");
var sys = require("util");
var path = require("path");

// Define global $SS variable
global.$SS = {
  version: [0,0,4],    // TODO: Read this from package.json
  libs: {},            // Link all external modules we need throughout SocketStream here
  sys:  {},            // Link all internal SocketStream modules we will always need to have loaded here
  models: {},          // Attach Realtime Models here
  connected_users: {}, // Each authenticated user is added to this object so we can find them for private pub/sub
  redis: {}            // Connect main and pubsub active connections here
};

// Set root dir
$SS.root = fs.realpathSync();

// Load external libs used throughout SocketStream.
// TODO: Automate the loading and give guidence when correct version is missing
// Also it would be great if we could load whatever version is in package.json to avoid repitition
$SS.libs.coffee =     require('coffee-script@1.0.0');
$SS.libs.io =         require('socket.io@0.6.10');
$SS.libs.static =     require('node-static@0.5.3');
$SS.libs.jade =       require('jade@0.6.0');
$SS.libs.stylus =     require('stylus@0.5.1');
$SS.libs.uglifyjs =   require("uglify-js@0.0.3");
$SS.libs.redis =      require('redis@0.5.2');

// Load basic Array, String, JS extensions needed throughout SocketStream
require('./extensions');

// Set Framework Paths
require.paths.unshift('./lib/server');
require.paths.unshift('./app/shared');
require.paths.unshift('./app/models');

// Load any vendored modules
try {
  fs.readdirSync("./vendor").forEach(function(name){
    require.paths.unshift("./vendor/" + name + "/lib");  
  });
} catch(e) {}

// Set Environment
$SS.env = (env = process.env.NODE_ENV) ? env.toString().toLowerCase() : 'development';

// Set default config and merge it with any application config file
require('./configurator.coffee').configure();

// Load SocketStream internal system modules we will *always* need to load
$SS.sys.log =     new (require('./logger.coffee').Logger);
$SS.sys.server =  new (require('./server.coffee').Server);
$SS.sys.asset =   new (require('./asset').Asset);

// Load Database configuration if present
try {
  result = require($SS.root + '/config/db');
} catch(e) {
  if (!e.message.match(/(^Cannot find module)(db$)/)) throw(e)
}


// EXTERNAL FUNCTIONS //

// Start up the SocketStream PubSub system
exports.init = function() {
  
  // Load Redis. Note these connections stay open so scripts will cease to terminate on their own once you call this
  require('./redis').setup()

  // Link SocketStream modules we offer as part of the Server API
  Publish = require('./publish').Publish;
  $SS.publish = new Publish;
  
  return this;
};

// Start up the SocketStream Web Server
exports.start = function() {
  $SS.sys.asset.init();
  $SS.config.pack_assets ? $SS.sys.asset.pack.all() : $SS.sys.asset.monitor();
  $SS.sys.server.start();
};
