var channels, connect, sessionStore, socketIdsBy;

connect = require('../connect');

channels = require('./channels');

socketIdsBy = require('../websocket/subscribe').socketIdsBy;

sessionStore = new connect.session.MemoryStore;

exports.options = {
  maxAge: null
};

exports.store = {
  use: function(nameOrStore, options) {
    var RedisStore;
    return sessionStore = nameOrStore === 'redis' ? (RedisStore = require('connect-redis')(connect), new RedisStore(options)) : nameOrStore;
  },
  get: function() {
    return sessionStore;
  }
};

exports.findOrCreate = function(sessionId, socketId, cb) {
  return sessionStore.load(sessionId, function(err, session) {
    if (!session) return cb(false);
    session.channel = channels.init(session, socketId);
    session.setUserId = function(userId, cb) {
      if (cb == null) cb = function() {};
      this.userId = userId;
      this._bindToSocket();
      return this.save(cb);
    };
    session._bindToSocket = function() {
      if (session.userId != null) socketIdsBy.user.add(session.userId, socketId);
      if ((session.channels != null) && session.channels.length > 0) {
        channels.init(session, socketId)._bindToSocket();
      }
      return this;
    };
    session.save = function(cb) {
      return sessionStore.set(sessionId, session, cb);
    };
    session._bindToSocket();
    return cb(session);
  });
};
