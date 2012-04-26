var redis;

redis = require('redis');

module.exports = function(config) {
  var conn, host, options, port;
  if (config == null) config = {};
  if (config.redis) {
    throw new Error("Note the {redis: {}} object wrapper was removed in 0.3 alpha3. Please pass any Redis server options to ss.session.store.use('redis') and ss.publish.transport.use('redis') directly.");
  }
  port = config.port || 6379;
  host = config.host || "127.0.0.1";
  options = config.options || {};
  conn = {};
  ['pub', 'sub'].forEach(function(name) {
    conn[name] = redis.createClient(port, host, options);
    if (config.pass) conn[name].auth(config.pass);
    if (config.db) return conn[name].select(config.db);
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
