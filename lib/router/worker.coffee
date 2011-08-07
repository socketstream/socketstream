# Router Worker
# -------------
# Launched by the 'socketstream router' process manager which will restart this process should it die.
# The router performs the following functions:
#
# 1. Brokers requests from multiple front end processes to multiple back end processes
# 2. Proxies broadcast/channel/user messages from Redis to front end servers (so Redis can live on a protected subnet)
# 3. Issues commands to be run on back end servers at regular intervals
#
# Note: the router automatically starts when you launch the integrated 'socketstream server'
# For now there should only be one router worker process running in your cluster.
# Ideally the the host running this will have dual NICs and hence act as a firewall.
# As this is currently a single point of failure, the host running the router needs to be monitored carefully
# We will work hard to reduce all single points of failure in the future. ZeroMQ/scaling experts please get in touch :)
# Oh, and if you fancy writing this router in C or Erlang, please go ahead! We'd love to see the benchmarks :)

util = require('util')
zeromq = require('zeromq')

# Load Redis. Note these connections stay open so scripts will cease to terminate on their own once you call this
redis = require('../redis.coffee').connect()

# Counters
sent = 0
recv = 0
events = 0

# Connect to sockets
frontend = zeromq.createSocket('xrep')
backend  = zeromq.createSocket('xreq')
pub =      zeromq.createSocket('pub')

# Bind to ZeroMQ Sockets
frontend.bindSync SS.config.cluster.sockets.fe_main
backend.bindSync  SS.config.cluster.sockets.be_main
pub.bindSync      SS.config.cluster.sockets.fe_pub

exports.init = (args) ->
  routeRequests()
  proxyEvents()
  updateUsersOnline() if SS.config.users.online.enabled
  showTraffic() if args?['--show-traffic']


# Private

routeRequests = ->  
  frontend.on 'message', (f_env, f_data) ->
    backend.send f_env, f_data
    recv++
  
  backend.on 'message', (b_env, b_data) ->
    frontend.send b_env, b_data
    sent++

# The router subscribes to Redis and simply forwards all incoming messages to all connected frontend servers (which in turn forwards them to the correct browsers via websockets)
# Why do we do this? So Redis can sit securely behind the firewall and not be directly exposed to the Internet
proxyEvents = ->
  key = SS.config.redis.key_prefix

  # Note: User and channel messages are multiplexed over a single Redis channel. See http://groups.google.com/group/socketstream/browse_thread/thread/f7a8b3e932102d62 for more details
  redis.pubsub.subscribe "#{key}:broadcast"     # Messages to be delivered to all connected websockets
  redis.pubsub.subscribe "#{key}:users"         # Messages to be delivered to all clients logged in with this user_id
  redis.pubsub.subscribe "#{key}:channels"      # Messages to be delivered to all connected websockets subscribed to these channels
  redis.pubsub.subscribe "#{key}:system"        # Internal system messages. Normally from back end to front end servers for now

  # Every time we get get a message from Redis (for SocketStream), fan out upstream to all subscribed frontend servers
  redis.pubsub.on 'message', (channel, message) ->
    [prefix, msg_type] = channel.split(':')
    if prefix && prefix == SS.config.redis.key_prefix && message
      pub.send 'events', msg_type, message
      events++

# Send a command to tell one of the back end workers to update the users online list
# Note the router issues the command as it's the best way to ensure it only gets run once in the given interval
# The only way round this is to elect one of the active back end servers as master, but that's a whole world of pain we don't need to get into right now
updateUsersOnline = ->
  sendCommand 'system:users:online:refresh'
  # Run this command again in SS.config.users.online.update_secs seconds (default = 60)
  setTimeout arguments.callee, (SS.config.users.online.update_interval * 1000)

# Send a system command to one of the available back end workers
sendCommand = (command) ->
  backend.send 'system', JSON.stringify({type: command})

# Print out basic status information. If you're seeing more INs than OUTs that's fine - some commands don't return a response
displayStatus = ->
  util.log "#{recv} REQ/CMDs IN - #{sent} RESPONSES OUT - #{events} EVENTS PROXIED"

# Show the status every 2 seconds
showTraffic = ->
  setInterval displayStatus, 2000
