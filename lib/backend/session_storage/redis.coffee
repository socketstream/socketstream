# Redis Session Storage
# ---------------------
# Recommended session storage engine

# Load Redis. Note these connections stay open so scripts will cease to terminate on their own once you call this
#SS.redis = require('../../redis.coffee').connect()

serialize_keys = ['attributes', 'channels']
oneDay = 86400



module.exports =

  getAll: (id, cb) ->
    console.trace()
    SS.redis.main.get id, (err, data) ->
      console.log(data)
      cb JSON.parse(data.toString())

  set: (id, name, value, cb = ->) ->
    console.trace()
    self = @
    @getAll id, (data) ->
      data[name] = value
      self._setex id, data, cb
      console.log(data)

  _setex: (id, data, cb) ->
    maxAge = data.cookie.maxAge
    ttl = if 'number' == typeof maxAge then maxAge / 1000 | 0 else oneDay
    sess = JSON.stringify data
    SS.redis.main.setex id, ttl, sess, cb
  
  delete: (id, name, cb = ->) ->
    self = @
    @getAll id, (data) ->
      delete data[name]
      self._setex id, data, cb
