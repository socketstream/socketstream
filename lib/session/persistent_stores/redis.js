var key, redis;

redis = require('redis');

exports.init = function(config) {
  var conn, host, options, port;
  if (config == null) config = {};
  port = config.redis && config.redis.port || 6379;
  host = config.redis && config.redis.host || "127.0.0.1";
  options = config.redis && config.redis.options || {};
  conn = redis.createClient(port, host, options);
  return {
    lookup: function(sessionId, cb) {
      return conn.get(key(sessionId), function(err, data) {
        var obj;
        obj = JSON.parse(data);
        return cb(obj);
      });
    },
    store: function(sessionId, obj, cb) {
      var data;
      data = JSON.stringify(obj);
      return conn.set(key(sessionId), data, function(err, data) {
        return cb(obj);
      });
    }
  };
};

key = function(id) {
  return "ss:session:" + id;
};
