# Redis Session Storage
# ---------------------
# Recommended session storage engine

serialize_keys = ['attributes', 'channels']

module.exports =

  getAll: (id, cb) ->
    SS.redis.main.hgetall key(id), (err, data) ->
      serialize_keys.forEach (key) ->
        data[key] = JSON.parse(data[key]) if data[key]?
      cb data

  set: (id, name, value, cb = ->) ->
    value = JSON.stringify(value) if serialize_keys.include(name)
    SS.redis.main.hset key(id), name, value, -> cb true
  
  delete: (id, name, cb = ->) ->
    SS.redis.main.hdel key(id), name, -> cb(true)


# The Session Key in Redis
key = (id) ->
  "#{SS.config.redis.key_prefix}:session:#{id}"