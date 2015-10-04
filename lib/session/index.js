// Sessions
// --------
// Creates a wrapper around a Connect Session Store object
'use strict';



var channels = require('./channels'), 
    subscriptions = require('../websocket/subscriptions'),
    uid = require('uid2'), //TODO replace dodgy package
    create, sessionStore;

module.exports = function(ss) {

  var expressSession = ss.require('express-session');

  // Define default session store
  sessionStore = new expressSession.MemoryStore;

  var api = {

    // Expose options which can be changed in your app
    options: {
      maxAge: null, // by default session exists for duration of user agent (e.g. until browser is closed)
      secret: "SocketStream" //TODO add config todo for dev time logging
    },

    // Manually create a new session (for running server-side tests, or calling responders from ss-console)
    create: function() {
      var sessionId;
      sessionId = uid(24);
      create(sessionId);
      return sessionId;
    },

    // Find a session from the Connect Session Store
    // Note: Sessions are automatically created by the connect.session()
    // middleware when the browser makes a HTTP request
    find: function(sessionId, socketId, cb) {
      return sessionStore.load(sessionId, function(err, session) {
        // Create a new session if we don't have this sessionId in memory
        // Note: in production you should be using Redis or another
        // persistent store so this should rarely happen
        if (!session) {
          session = create(sessionId);
        }

        // Append methods to session object
        session.channel = channels(ss, session, socketId);
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
    },

    // Allow use of any Connect Session Store
    store: {
      use: function(nameOrStore, options) {
        var RedisStore;
        // Allow any Connect Session Store *instance* to be used
        //jshint -W093
        return (sessionStore = nameOrStore === 'redis' ? (RedisStore = require('connect-redis')(expressSession), new RedisStore(options)) : nameOrStore);
      },
      get: function() {
        return sessionStore;
      }
    }
  };

  return api;

  // PRIVATE

  function create(sessionId) {
    var session;
    session = new expressSession.Session({
      sessionID: sessionId,
      sessionStore: sessionStore
    });
    session.cookie = {
      maxAge: api.options.maxAge
    };
    session.save();
    return session;
  }
};


