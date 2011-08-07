# Connected Clients
# -----------------
# Store details of sockets which are authenticated or belong to channels so
# we can quickly message them when incoming events are proxied from Redis

# Define a simple set
class Set

  constructor: ->
    @store = {}

  add: (name, socket) ->
    if @store[name]
      @store[name].push(socket) unless @store[name].contains(socket)
    else
      @store[name] = [socket]

  remove: (name, socket) ->
    @store[name] = @store[name].delete(socket)

  getAll: (name) ->
    a = @store[name]
    if a and a.any() then a else []

# Store sockets by session_id
exports.sessions = {}

# Store sockets subscribed to channels
exports.channels = (new Set)

# Users Connected (to this front-end server instance only)
# Remember users can be logged in via multiple devices at once
exports.users = (new Set)
