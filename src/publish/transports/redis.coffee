# Publish Event - Redis Transport

redis = require('redis')

exports.init = (config = {}) ->

  port = config.redis && config.redis.port || 6379
  host = config.redis && config.redis.host || "127.0.0.1"
  options = config.redis && config.redis.options || {}

  # Redis requires a seperate connection for pub/sub
  pub = redis.createClient(port, host, options)
  sub = redis.createClient(port, host, options)

  listen: (cb) ->
    sub.subscribe "ss:event"
    sub.on 'message', (channel, msg) ->
      obj = JSON.parse(msg)
      cb obj

  send: (obj) ->
    msg = JSON.stringify(obj)
    pub.publish "ss:event", msg
