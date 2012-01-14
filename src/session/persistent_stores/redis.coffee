# Redis persistent session store

redis = require('redis')

exports.init = (config = {}) ->

  port = config.redis && config.redis.port || 6379
  host = config.redis && config.redis.host || "127.0.0.1"
  options = config.redis && config.redis.options || {}

  conn = redis.createClient(port, host, options)

  lookup: (sessionId, cb) ->
    conn.get key(sessionId), (err, data) ->
      obj = JSON.parse(data)
      cb obj

  store: (sessionId, obj, cb) ->
    data = JSON.stringify(obj)
    conn.set key(sessionId), data, (err, data) ->
      cb obj

# Private

key = (id) ->
  "ss:session:#{id}"
