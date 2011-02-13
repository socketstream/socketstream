// Define global $SS variable
global.$SS = {

  version:          [0,0,1],
  
  // Link all external modules we need throughout SocketStream here
  libs:             {},
  
  // Link all internal SocketStream modules we will always need to have loaded here
  sys:              {},

  // Each authenticated user is added to this object so we can find them for private pub/sub
  connected_users:  {},

};

// Load the system libs we always need
global.fs =  require("fs");
global.sys = require("util");

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

// Load Redis
global.R =   $SS.libs.redis.createClient(); // Main connection
global.RPS = $SS.libs.redis.createClient(); // PubSub connection   
R.select(0); // use 9 for testing

// Set Framework Paths
require.paths.unshift('./lib/server');
require.paths.unshift('./app/shared');
require.paths.unshift('./app/models');

// Load any vendored modules
fs.readdirSync("./vendor").forEach(function(name){
  require.paths.unshift("./vendor/" + name + "/lib");  
});

// Set Environment
$SS.env = (env = process.env.NODE_ENV) ? env.toString().toLowerCase() : 'development';

// Set Default Config
$SS.config = {
  port:               3000,
  redis:              {},        // defaults to localhost
  log_level:          3,         // 0 = none, 1 = calls only, 2 = calls + params, 3 = full
  pack_assets:        false,     // set this to true on staging and production
  throw_errors:       true       // this needs to be false in production or the server will quit on any error
}

// For now let's override default config depending upon environment. This will still be overridden by any app config file in
// /config/environments/NODE_ENV.js . We may want to remove this in the future and insist upon seperate app config files, ala Rails
if ($SS.env != 'development') {
  $SS.config.pack_assets = true;
}
if ($SS.env == 'production') {
  $SS.config.log_level = 0;
  $SS.config.throw_errors = false;
};

// Load SocketStream internal system modules we will *always* need to load
$SS.sys.log =     new (require('./logger.coffee').Logger)
$SS.sys.server =  new (require('./server.coffee').Server)
$SS.sys.asset =   new (require('./asset').Asset)

// Link SocketStream modules we offer as part of the Server API
Publish = require('./publish').Publish;
$SS.publish = new Publish;
