# Redis
# -----
# Setup Redis main (data) and pub/sub connections based upon the config params in SS.config

redis = require('redis')

exports.connect = ->
  main:   main()
  pubsub: pubsub()

# Main data channel. Used for session storage, and available within your app
main = ->
  config = SS.config.redis
  global.R = open(config)
  R.auth(SS.config.redis.password) if SS.config.redis.password
  R.select(config.db_index)
  R

# Redis requires a separate connection for PubSub data
pubsub = ->
  config = SS.config.redis_pubsub || SS.config.redis
  conn = open(config)
  conn.auth(config.password) if config.password
  conn.select(config.db_index)
  conn

# Opens Redis connection if config is valid
open = (config) ->
  try
    if valid(config)
      redis.createClient(config.port, config.host, config.options)
  catch e
    SS.log.error.exception(e)
    throw 'Unable to continue loading SocketStream'

# Validates config params are set properly. This really needs tests!
valid = (config) ->
  unless typeof(config) == 'object'
    throw ['redis_config_not_valid_object', 'Redis config is not a valid object']

  ['host','options','port'].forEach (param) ->
    throw ['redis_config_no_required_params', "Redis config is missing the '#{param}' param"] unless SS.config.redis.hasOwnProperty(param)
   
  unless typeof(config.port) == 'number'
    throw ['redis_config_port_nan','Redis port number must be a number']

  true
