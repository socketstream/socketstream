// Publish Event - Redis Transport
var redis;

redis = require('redis');

module.exports = function(config) {
  var conn, host, options, port;
  if (config == null) {
    config = {};
  }

  // Set options or use the defaults  
  port = config.port || 6379;
  host = config.host || "127.0.0.1";
  options = config.options || {};

  // Redis requires a separate connection for pub/sub  
  conn = {};
  ['pub', 'sub'].forEach(function(name) {
    conn[name] = redis.createClient(port, host, options);
    if (config.pass) {
      conn[name].auth(config.pass);
    }
    if (config.db) {
      return conn[name].select(config.db);
    }
  });
  return {
    listen: function(cb) {
      conn.sub.subscribe("ss:event");
      return conn.sub.on('message', function(channel, msg) {
        return cb(JSON.parse(msg));
      });
    },
    send: function(obj) {
      var msg;
      msg = JSON.stringify(obj);
      return conn.pub.publish("ss:event", msg);
    }
  };
};
