// Sessions
// --------
// Creates a wrapper around a Connect Session Store object
'use strict';

var channels = require('./channels'),
    subscriptions = require('../websocket/subscriptions'),
    uuid = require('uuid'),
    sessionStore,
    strategy = {};

var Store = require('./store'),
    MemoryStore = require('./memory'),
    Cookie = require('./cookie'),
    Session = require('./session');

/**
 * Warning message for `MemoryStore` usage in production.
 * @private
 */
var warning = ['Warning: connect.session() MemoryStore is not',
    'designed for a production environment, as it will leak',
    'memory, and will not scale past a single process.'].join('\n');

module.exports = function(ss) {

  var api = {

    // Expose options which can be changed in your app
    options: {
      maxAge: null, // by default session exists for duration of user agent (e.g. until browser is closed)
      secret: "SocketStream" //TODO add config todo for dev time logging
    },

    strategy: strategy,
    
    setStrategy: function(_strategy) {
      this.strategy = strategy = _strategy;
    },

    Store: Store,
    MemoryStore: MemoryStore,
    Cookie: Cookie,
    Session: Session,

    // Manually create a new session (for running server-side tests, or calling responders from ss-console)
    create: function() {
      var sessionId = uuid.v1();
      this.strategy.create(sessionId);
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
          session = strategy.create(sessionId);
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

    extractSocketSessionId: function(request) {
      this.strategy.extractSocketSessionId(request, this.options);
    },

    // Allow use of any Connect Session Store
    store: {
      use: function(nameOrStore, options) {
        var RedisStore;
        // Allow any Connect Session Store *instance* to be used
        //jshint -W093
        return (sessionStore = nameOrStore === 'redis' ?
          (RedisStore = ss.require('connect-redis')(api), new RedisStore(options)) :
          nameOrStore);
      },
      get: function() {
        if (sessionStore == null) {
          // notify user that this store is not
          // meant for a production environment
          if ('production' === ss.env) {
            ss.log.warn(warning);
          }
          // Define default session store (no default impl for now, is set in session strategy addon socketstream-cookie-session)
          sessionStore = new api.MemoryStore();
        }
        return sessionStore;
      }
    }
  };

  return api;
};
