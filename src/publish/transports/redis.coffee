# Publish Event - Redis Transport

redis = require('redis')

exports.init = (config = {}) ->

  # REMOVE_BEFORE_0.3.0
  throw new Error("Note the {redis: {}} object wrapper was removed in 0.3 alpha3. Please pass any Redis server options to ss.session.store.use('redis') and ss.publish.transport.use('redis') directly.") if config.redis

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
