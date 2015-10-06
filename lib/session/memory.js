/*!
 * express-session
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
'use strict';

/**
 * Module dependencies.
 * @private
 */

var Store = require('./store');

/**
 * Shim setImmediate for node.js < 0.10
 * @private
 */

/* istanbul ignore next */
var defer = typeof setImmediate === 'function' ?
    setImmediate :
    function(fn){ process.nextTick(fn.bind.apply(fn, arguments)) }

/**
 * Module exports.
 */

module.exports = MemoryStore

/**
 * A session store in memory.
 * @public
 */

function MemoryStore() {
  Store.call(this)
  this.sessions = Object.create(null)
}

/**
 * Inherit from Store.
 */
MemoryStore.prototype = Object.create(Store.prototype);

/**
 * Get all active sessions.
 *
 * @param {function} callback
 * @public
 */

MemoryStore.prototype.all = function all(callback) {
  var sessionIds = Object.keys(this.sessions)
  var sessions = Object.create(null)

  for (var i = 0; i < sessionIds.length; i++) {
    var sessionId = sessionIds[i]
    var session = getSession(this.sessions, sessionId)

    if (session) {
      sessions[sessionId] = session;
    }
  }

  if (callback) {
     defer(callback, null, sessions);
  }
}

/**
 * Clear all sessions.
 *
 * @param {function} callback
 * @public
 */

MemoryStore.prototype.clear = function clear(callback) {
  this.sessions = Object.create(null)
  if (callback) {
     defer(callback);
  }
}

/**
 * Destroy the session associated with the given session ID.
 *
 * @param {string} sessionId
 * @public
 */

MemoryStore.prototype.destroy = function destroy(sessionId, callback) {
  delete this.sessions[sessionId]
  if (callback) {
     defer(callback);
  }
}

/**
 * Fetch session by the given session ID.
 *
 * @param {string} sessionId
 * @param {function} callback
 * @public
 */

MemoryStore.prototype.get = function get(sessionId, callback) {
  defer(callback, null, getSession(this.sessions, sessionId))
}

/**
 * Commit the given session associated with the given sessionId to the store.
 *
 * @param {string} sessionId
 * @param {object} session
 * @param {function} callback
 * @public
 */

/**
 * Get number of active sessions.
 *
 * @param {function} callback
 * @public
 */

MemoryStore.prototype.length = function length(callback) {
  this.all(function (err, sessions) {
    if (err) { return callback(err); }
    callback(null, Object.keys(sessions).length)
  })
}

MemoryStore.prototype.set = function set(sessionId, session, callback) {
  this.sessions[sessionId] = JSON.stringify(session)
  if (callback) {
     defer(callback);
  }
}

/**
 * Touch the given session object associated with the given session ID.
 *
 * @param {string} sessionId
 * @param {object} session
 * @param {function} callback
 * @public
 */

MemoryStore.prototype.touch = function touch(sessionId, session, callback) {
  var currentSession = getSession(this.sessions, sessionId)

  if (currentSession) {
    // update expiration
    currentSession.cookie = session.cookie
    this.sessions[sessionId] = JSON.stringify(currentSession)
  }

  if (callback) {
     defer(callback);
  }
}

/**
 * Get session from the store.
 * @private
 */

function getSession(sessions, sessionId) {
  var sess = sessions[sessionId]

  if (!sess) {
    return
  }

  // parse
  sess = JSON.parse(sess)

  var expires = typeof sess.cookie.expires === 'string' ?
    new Date(sess.cookie.expires) :
    sess.cookie.expires

  // destroy expired session
  if (expires && expires <= Date.now()) {
    delete sessions[sessionId];
    return
  }

  return sess
}