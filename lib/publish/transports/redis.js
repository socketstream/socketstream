var redis;

redis = require('redis');

exports.init = function(config) {
  var host, options, port, pub, sub;
  if (config == null) config = {};
  port = config.redis && config.redis.port || 6379;
  host = config.redis && config.redis.host || "127.0.0.1";
  options = config.redis && config.redis.options || {};
  pub = redis.createClient(port, host, options);
  sub = redis.createClient(port, host, options);
  return {
    listen: function(cb) {
      sub.subscribe("ss:event");
      return sub.on('message', function(channel, msg) {
        var obj;
        obj = JSON.parse(msg);
        return cb(obj);
      });
    },
    send: function(obj) {
      var msg;
      msg = JSON.stringify(obj);
      return pub.publish("ss:event", msg);
    }
  };
};
