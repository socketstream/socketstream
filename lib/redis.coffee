# Setup Redis main (data) and pub/sub connections

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
  if valid(config)
    $SS.libs.redis.createClient(config.port, config.host, config.options)

# Validates config params are set properly. This really needs tests!
valid = (config) ->
  unless typeof(config) == 'object'
    throw 'Redis config is not a valid object' 	

  required_params = ['host','options','port']
  unless JSON.stringify(config.keys().sort()) == JSON.stringify(required_params) # sometimes you just miss ruby
    throw "Redis config does not contain required params (#{required_params.join(',')})" 		
   
  unless typeof(config.port) == 'number'
    throw 'Redis port number must be a number' 	

  true

