var Store, cache, channels, session, socketIdsBy;

channels = require('./channels');

socketIdsBy = require('../websocket/subscribe').socketIdsBy;

exports.store = require('./store');

Store = exports.store.Store;

cache = {};

exports.findOrCreate = function(sessionId, socketId, cb) {
  var store;
  if (store = cache[sessionId]) {
    return cb(session(store, socketId)._bindToSocket());
  } else {
    return exports.store.lookup(sessionId, function(storeSession) {
      store = cache[sessionId] = new Store(sessionId);
      if (storeSession) {
        store.userId = storeSession.userId;
        store.channels = storeSession.channels;
      }
      return cb(session(store, socketId)._bindToSocket());
    });
  }
};

session = function(store, socketId) {
  return {
    userId: store.userId,
    channel: channels.init(store, socketId),
    setUserId: function(userId, cb) {
      if (cb == null) cb = function() {};
      store.userId = userId;
      this._bindToSocket();
      return store.save(cb);
    },
    _store: store,
    _bindToSocket: function() {
      if (store.userId != null) socketIdsBy.user.add(store.userId, socketId);
      if (store.channels.length > 0) {
        channels.init(store, socketId)._bindToSocket();
      }
      return this;
    }
  };
};
