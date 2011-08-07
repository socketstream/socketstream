# Request Handler for Benchmark functions
# ---------------------------------------
# Used by 'socketstream benchmark'

key = SS.config.redis.key_prefix
utils = require('../../utils')

# Simply responds with a 1
SS.backend.responders.on 'b:simple', (obj, cb) ->
  cb {id: obj.id, result: 1}

# Simulates doing real blocking work by generating 1000 random strings
SS.backend.responders.on 'b:work', (obj, cb) ->
  utils.randomString(20) for num in [0..1000]
  cb {id: obj.id, result: 1}

# Simulates non-blocking Redis work
SS.backend.responders.on 'b:redis:setget', (obj, cb) ->
  num = Math.random().toString().split('.')[1]
  R.hset "#{key}:benchmark", num, (num * 2), ->
    R.hget "#{key}:benchmark", num, (err, data) ->
      if Number(data) == (num * 2)
        cb {id: obj.id, result: num}
      else
        throw new Error('Redis GET/SET benchmark test failed - unable to retrieve correct value')
