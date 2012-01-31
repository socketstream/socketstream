# Redis persistent session store

redis = require('redis')

oneDay = 86400

exports.init = (config = {}) ->

  port = config.redis && config.redis.port || 6379
  host = config.redis && config.redis.host || "127.0.0.1"
  options = config.redis && config.redis.options || {}

  conn = redis.createClient(port, host, options)

  lookup: (sessionId, cb) ->
    conn.get key(sessionId), (err, data) ->
      obj = JSON.parse(data)
      console.log "redis.lookup", data
      console.log "redis.lookup.err", err
      console.log "redis.lookup.sid", sessionId
      cb obj

  store: (sessionId, obj, cb) ->
    data = JSON.stringify(obj)
    maxAge = obj.cookie.maxAge
    ttl = if 'number' == typeof maxAge then maxAge / 1000 | 0 else oneDay
    conn.setex key(sessionId), ttl, data, (err, data) ->
      cb obj

key = (sessionId) ->
  'sess:' + sessionId.split('.')[0]
