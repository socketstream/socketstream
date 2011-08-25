# ZeroMQ Router Worker
# --------------------
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

# Load Redis event proxy
proxy = require('./redis_proxy.coffee')

# Load Job Scheduler
scheduler = require('./job_scheduler.coffee')

# Counters
sent = 0
recv = 0

# Connect to sockets
frontend = SS.internal.zmq.createSocket('xrep')
backend  = SS.internal.zmq.createSocket('xreq')

# Bind to ZeroMQ Sockets
frontend.bindSync SS.config.cluster.sockets.fe_main
backend.bindSync  SS.config.cluster.sockets.be_main

exports.init = (args) ->
  routeRequests()
  proxy.init()
  scheduler.run()

  showTraffic() if args?['--show-traffic']


# Private

routeRequests = ->  
  frontend.on 'message', (f_env, f_data) ->
    backend.send f_env, f_data
    recv++
  
  backend.on 'message', (b_env, b_data) ->
    frontend.send b_env, b_data
    sent++

# Print out basic status information. If you're seeing more INs than OUTs that's fine - some commands don't return a response
displayStatus = ->
  console.log "#{recv} REQ/CMDs IN - #{sent} RESPONSES OUT - #{proxy.num_events_proxied} EVENTS PROXIED"

# Show the status every 2 seconds
showTraffic = ->
  setInterval displayStatus, 2000
