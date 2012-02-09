var redis;

redis = require('redis');

exports.init = function(config) {
  var host, options, port, pub, sub;
  if (config == null) config = {};
  if (config.redis) {
    throw new Error("Note the {redis: {}} object wrapper was removed in 0.3 alpha3. Please pass any Redis server options to ss.session.store.use('redis') and ss.publish.transport.use('redis') directly.");
  }
  port = config.port || 6379;
  host = config.host || "127.0.0.1";
  options = config.options || {};
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
