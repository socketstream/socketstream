// Define global $SS variable
global.$SS = global.SocketStream = {

  version:          [0,0,1],

  // Each authenticated user is added to this object so we can find them for private pub/sub
  connected_users:  {},

  // Set default config. Override any params before calling app.start()
  config: {
    port:             3000,
    log_level:        3,         // 0 = none, 1 = calls only, 2 = calls + params, 3 = full
    redis:            {},        // defaults to localhost
    pack_assets:      false      // set this to true on staging and production
  }

};

// Load the libs we always need
global.fs =  require("fs");
global.sys = require("util");

// Require Coffee Script
global.coffee = require('coffee-script@1.0.0');

// Load basic Array, String, JS extensions needed throughout SocketStream
require('./extensions');

// Load Redis
var redis = require('redis@0.5.2');
global.R =   redis.createClient(); // Main connection
global.RPS = redis.createClient(); // PubSub connection   
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
