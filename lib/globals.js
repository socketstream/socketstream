// Define global $SS variable
global.$SS = {

  version:          [0,0,1],
  
  // Link libraries we need throughout SocketStream here to avoid global vars
  libs:             {},

  // Each authenticated user is added to this object so we can find them for private pub/sub
  connected_users:  {},

};

// Load the system libs we always need
global.fs =  require("fs");
global.sys = require("util");

// Load external libs used throughout SocketStream.
// TODO: Automate the loading and give guidence when correct version is missing
$SS.libs.coffee =     require('coffee-script@1.0.0');
$SS.libs.jade =       require('jade@0.6.0');
$SS.libs.stylus =     require('stylus@0.2.1');
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
require.paths.unshift('./app/server');
require.paths.unshift('./app/models');

// Load any vendored modules
fs.readdirSync("./vendor").forEach(function(name){
  require.paths.unshift("./vendor/" + name + "/lib");  
});

// Set Environment
$SS.env = global.NODE_ENV = process.env.NODE_ENV || 'development';

// Set Default Config
$SS.config = {
  port:               3000,
  redis:              {},        // defaults to localhost
  log_level:          3,         // 0 = none, 1 = calls only, 2 = calls + params, 3 = full
  pack_assets:        false      // set this to true on staging and production
}

// For now let's override default config depending upon environment. This will still be overridden by any app config file in
// /config/environments/NODE_ENV.js . We may want to remove this in the future and insist upon seperate app config files, ala Rails
if ($SS.env != 'development')     $SS.config.pack_assets = true   
if ($SS.env == 'production')      $SS.config.log_level = 0        

