# Internal Memory Session Storage
# -------------------------------
# Should only be used when developing / experimenting with SocketStream as no sweeping currently occurs
# TODO: Clean up old sessions to prevent memory from ever-expanding

store = {}

module.exports =

  getAll: (id, cb) ->
    cb store[id]

  set: (id, name, value, cb = ->) ->
    store[id] = {} unless store[id]?
    store[id][name] = value
    cb true

  delete: (id, name, cb = ->) ->
    store[id] && delete store[id][name]
    cb true