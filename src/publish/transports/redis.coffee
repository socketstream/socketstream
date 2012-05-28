# Publish Event - Redis Transport

redis = require('redis')

module.exports = (config = {}) ->

  # Set options or use the defaults
  port = config.port || 6379
  host = config.host || "127.0.0.1"
  options = config.options || {}

  # Redis requires a separate connection for pub/sub
  conn = {}
  ['pub','sub'].forEach (name) ->
    conn[name] = redis.createClient(port, host, options)
    conn[name].auth(config.pass) if config.pass 
    conn[name].select(config.db) if config.db

  listen: (cb) ->
    conn.sub.subscribe "ss:event"
    conn.sub.on 'message', (channel, msg) ->
      cb JSON.parse(msg)

  send: (obj) ->
    msg = JSON.stringify(obj)
    conn.pub.publish "ss:event", msg
