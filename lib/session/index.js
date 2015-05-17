// Sessions
// --------
// Creates a wrapper around a Connect Session Store object
'use strict';



var create, sessionSecret;

var expressSession = require('express-session');

var channels = require('./channels');

var subscriptions = require('../websocket/subscriptions');

var uid = require('uid2');

// Define default session store
var sessionStore = new expressSession.MemoryStore;

// Expose options which can be changed in your app
exports.options = {
  maxAge: null // by default session exists for duration of user agent (e.g. until browser is closed)
};

// Allow use of any Connect Session Store
exports.store = {
  use: function(nameOrStore, options) {
    var RedisStore;
    // Allow any Connect Session Store *instance* to be used
    return (sessionStore = nameOrStore === 'redis' ? (RedisStore = require('connect-redis')(expressSession), new RedisStore(options)) : nameOrStore);
  },
  get: function() {
    return sessionStore;
  }
};

// TODO: expand this functionality; expose the sessions options as part of the ss API
exports.setSecret(secret) {
  sessionSecret = secret;
};

// Manually create a new session (for running server-side tests, or calling responders from ss-console)
exports.create = function() {
  var sessionId;
  sessionId = uid(24);
  create(sessionId);
  return sessionId;
};

// Find a session from the Connect Session Store
// Note: Sessions are automatically created by the connect.session()
// middleware when the browser makes a HTTP request
exports.find = function(sessionId, socketId, cb) {
  return sessionStore.load(sessionId, function(err, session) {
    // Create a new session if we don't have this sessionId in memory
    // Note: in production you should be using Redis or another
    // persistent store so this should rarely happen
    if (!session) {
      session = create(sessionId);
    }

    // Append methods to session object    
    session.channel = channels(session, socketId);
    session.setUserId = function(userId, cb) {
      if (!cb) {
        cb = function() {};
      }
      if (userId) {
        this.userId = userId;
        this._bindToSocket();
      } else if (this.userId) {  // if null (i.e. user has signed out)
        subscriptions.user.remove(this.userId, socketId);
        delete this.userId;
      }
      return this.save(cb);
    };

    // Bind username and any channel subscriptions to this socketID on each request    
    session._bindToSocket = function() {
      if (session.userId) {
        subscriptions.user.add(session.userId, socketId);
      }
      if ((session.channels) && session.channels.length > 0) {
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

// PRIVATE

create = function(sessionId) {
  var session;
  session = new expressSession.Session({
    secret: sessionSecret || 'SocketStream secret', // TODO: document setting secret
    sessionID: sessionId,
    sessionStore: sessionStore
  });
  session.cookie = {
    maxAge: exports.options.maxAge
  };
  session.save();
  return session;
};
