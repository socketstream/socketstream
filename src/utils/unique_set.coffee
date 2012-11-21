# This is used to maintain lists of userIds to socketIds and channelIds to socketIds

class exports.UniqueSet

  constructor: ->
    @data = {}

  add: (key, value) ->
    return false unless key? and value?
    if set = @data[key]
      set.push(value) unless set.indexOf(value) >= 0
    else
      @data[key] = [value]

  remove: (key, value) ->
    return if @data[key] is undefined
    if (i = @data[key].indexOf(value)) >= 0
      @data[key].splice(i, 1)
      delete @data[key] if @data[key].length == 0

  removeFromAll: (value) ->
    @keys().forEach (key) =>
      @remove(key, value)

  keys: ->
    Object.keys(@data)

  members: (key) ->
    @data[key] || []