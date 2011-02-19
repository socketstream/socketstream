// SocketStream

// Make a note of the time now so we can show time taken to start up
var up_since = new Date;

var fs = require('fs');

require('coffee-script@1.0.0');
require('./boot.coffee');

// Start up the SocketStream PubSub system
exports.init = function() {
  $SS.internal.up_since = up_since;
  
  // Check to see this looks like a valid SocketStream project
  dirs = fs.readdirSync($SS.root)
  if (!dirs.include('app') || !dirs.include('public')) // All other dirs optional for now
    throw 'Oops! Unable to start SocketStream here. Not a valid project directory'
  
  // Load Redis. Note these connections stay open so scripts will cease to terminate on their own once you call this
  $SS.redis = require('./redis.coffee').connect()
  
  // Link SocketStream modules we offer as part of the Server API
  Publish = require('./publish.coffee').Publish;
  $SS.publish = new Publish;
  
  // Load Database configuration file if present
  var db_config_file = $SS.root + '/config/db';
  try {
    var db_config_exists = require.resolve(db_config_file);
  } catch(e) {};
  if(db_config_exists) require(db_config_file);

  return this;
};

// Start up the SocketStream Web Server
exports.start = function() {
  $SS.sys.asset.init();
  $SS.config.pack_assets ? $SS.sys.asset.pack.all() : $SS.sys.asset.monitor();
  $SS.sys.server.start();
};
