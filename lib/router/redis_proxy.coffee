# Redis Proxy
# -----------
# Listens to incoming events from Redis and proxies them to front end server, either over ZeroMQ
# or the internal EventEmitter

# Load Redis. Note these connections stay open so scripts will cease to terminate on their own once you call this
redis = require('../redis.coffee').connect()

rpc = new (require('../rpc/connection.coffee')).Publisher

exports.num_events_proxied = 0

# The router subscribes to Redis and simply forwards all incoming messages to all connected frontend servers (which in turn forwards them to the correct browsers via websockets)
# Why do we do this? So Redis can sit securely behind the firewall and not be directly exposed to the Internet
exports.init = (counter = 0) ->
  key = SS.config.redis.key_prefix

  # Subscribe to the following Redis channels
  # Note: User and channel messages are multiplexed over a single Redis channel. See http://groups.google.com/group/socketstream/browse_thread/thread/f7a8b3e932102d62 for more details
  ['broadcast', 'users', 'channels', 'frontend'].forEach (channel) ->
    redis.pubsub.subscribe "#{key}:#{channel}"

  # Every time we get get a message from Redis (for SocketStream), fan out upstream to all subscribed frontend servers
  redis.pubsub.on 'message', (channel, message) ->
    [prefix, msg_type] = channel.split(':')
    if prefix && prefix == SS.config.redis.key_prefix && message
      exports.num_events_proxied++
      rpc.send msg_type, message