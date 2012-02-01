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
      cb obj

  store: (sessionId, obj, cb) ->
    data = JSON.stringify(obj)
    # setex is used by Connect to specify timeout for automated eviction
    # of stale sessions from Redis database so it doesn't grow
    # over time
    maxAge = obj.cookie.maxAge
    ttl = if 'number' == typeof maxAge then maxAge / 1000 | 0 else oneDay
    conn.setex key(sessionId), ttl, data, (err, data) ->
      cb obj

# converts signed session id to session key used by Connect
# from session_key.session_key_hmac to sess:session_key
# TODO check session signature using the secret key passed to connect.cookieParser()
key = (sessionId) ->
  'sess:' + sessionId.split('.')[0]
