# Redis Session Storage
# ---------------------
# Recommended session storage engine

# Load Redis. Note these connections stay open so scripts will cease to terminate on their own once you call this
#SS.redis = require('../../redis.coffee').connect()

oneDay = 86400

module.exports =

  getAll: (id, cb) ->
    SS.redis.main.get id, (err, data) ->
      cb JSON.parse(data.toString())

  set: (id, name, value, cb = ->) ->
    self = @
    @getAll id, (data) ->
      data[name] = value
      self._setex id, data, cb

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
