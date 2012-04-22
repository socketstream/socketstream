var channels, connect, sessionStore, subscriptions;

connect = require('connect');

channels = require('./channels');

subscriptions = require('../websocket/subscriptions');

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

exports.create = function() {
  var Session, sessionID, thisSession;
  Session = connect.session.Session;
  sessionID = connect.utils.uid(24);
  thisSession = new Session({
    sessionID: sessionID,
    sessionStore: sessionStore
  });
  thisSession.cookie = {
    maxAge: null
  };
  thisSession.save();
  return sessionID;
};

exports.find = function(sessionId, socketId, cb) {
  return sessionStore.load(sessionId, function(err, session) {
    if (!session) return cb(false);
    session.channel = channels(session, socketId);
    session.setUserId = function(userId, cb) {
      if (cb == null) cb = function() {};
      this.userId = userId;
      this._bindToSocket();
      return this.save(cb);
    };
    session._bindToSocket = function() {
      if (session.userId != null) subscriptions.user.add(session.userId, socketId);
      if ((session.channels != null) && session.channels.length > 0) {
        session.channel._bindToSocket();
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
