global.SocketStream = {
  version: [0,0,1]
}

// Load the libs we always need
global.fs =  require("fs");
global.sys = require("util");

// Require Coffee Script
global.coffee = require('coffee-script@1.0.0');

// Load Basic Initializers
require('./initializers');

// Load Redis
global.redis = require('redis@0.5.2');
global.R = redis.createClient(); // TODO pass host options etc
R.select(0); // use 9 for testing

// Set Framework Paths
require.paths.unshift('./db');
require.paths.unshift('./lib/server');
require.paths.unshift('./app/server');
require.paths.unshift('./app/models');

// Load any vendored modules
fs.readdirSync("./vendor").forEach(function(name){
  require.paths.unshift("./vendor/" + name + "/lib");  
});

// Set Environment
global.NODE_ENV = process.env.NODE_ENV || 'development';

