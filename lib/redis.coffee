# Redis
# -----
# Setup Redis main (data) and pub/sub connections based upon the config params in $SS.config

exports.connect = ->
  main:   main()
  pubsub: pubsub()

# Main data channel. Used for session storage, and available within your app
main = ->
  config = $SS.config.redis
  global.R = open(config)
  R.select(0)
  R

# Redis requires a seperate connection for PubSub data
pubsub = ->
  config = $SS.config.redis_pubsub || $SS.config.redis
  conn = open(config)
  conn.select(0)
  conn

# Opens Redis connection if config is valid
open = (config) ->
  try
    if valid(config)
      $SS.libs.redis.createClient(config.port, config.host, config.options)
  catch e
    $SS.log.error.exception(e)
    throw 'Unable to continue loading SocketStream'

# Validates config params are set properly. This really needs tests!
valid = (config) ->
  unless typeof(config) == 'object'
    throw ['redis_config_not_valid_object', 'Redis config is not a valid object']

  required_params = ['host','options','port']
  unless JSON.stringify(config.keys().sort()) == JSON.stringify(required_params) # sometimes you just miss ruby
    throw ['redis_config_no_required_params', "Redis config does not contain required params (#{required_params.join(',')})"]
   
  unless typeof(config.port) == 'number'
    throw ['redis_config_port_nan','Redis port number must be a number']

  true
