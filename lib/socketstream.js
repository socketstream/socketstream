/*
  This file allows SocketStream to be called programatically from external Cakefiles, scripts or tests
  Make sure you run 'npm install socketstream' in your local project before requiring the library from another file

 Example commands:

   var ss = require('socketstream');     // Initializes the SS global variable

   ss.load();                            // Loads the project files, including the active configuration

   ss.start.single();                    // Start the server in single-process mode (required for Cloud9)

   ss.redis.connect();                   // Connects to the active instance of Redis, as specified in the config file
*/

// Require CoffeeScript so node understands .coffee files
require('coffee-script');

// Require the main engine
main = require(__dirname + '/../lib/main.coffee');

// Initialize the SS global variable
main.init();

// Load the project in the current path
exports.load = main.load.project;

// Expose the server start interface
exports.start = main.start;

// Expose the Redis library
exports.redis = require('./redis.coffee');