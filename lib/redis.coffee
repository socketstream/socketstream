# Setup Redis main (data) and pub/sub connections

exports.setup = ->
  openDataConnection()
  openPubSubConnection()

# Main data channel. Used for session storage, and available within your app
openDataConnection = ->
  config = $SS.config.redis
  global.R = $SS.redis.main = open(config)
  R.select(0)

# Redis requires a seperate connection for PubSub data
openPubSubConnection = ->
  config = $SS.config.redis_pubsub || $SS.config.redis
  $SS.redis.pubsub = open(config)
  $SS.redis.pubsub.select(0)

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

