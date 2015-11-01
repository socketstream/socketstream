/*!
 * Connect - session - Store
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */
'use strict';

/**
 * Module dependencies.
 */

var EventEmitter = require('eventemitter2').EventEmitter2,
  debug = require('debug')('sessionstore'),
  Session = require('./session'),
  Cookie = require('./cookie');

/**
 * Initialize abstract `Store`.
 *
 * @param options {Object} Store options
 * @api private
 */

var Store = module.exports = function Store(){};

/**
 * Inherit from `EventEmitter.prototype`.
 */

Store.prototype = Object.create(EventEmitter.prototype);

/**
 * Re-generate the given requests's session.
 *
 * @param {IncomingRequest} req
 * @return {Function} fn
 * @api public
 */

Store.prototype.regenerate = function(req, fn){
  var self = this;
  this.destroy(req.sessionID, function(err){
    self.generate(req);
    fn(err);
  });
};

/**
 * Load a `Session` instance via the given `sid`
 * and invoke the callback `fn(err, sess)`.
 *
 * @param {String} sid
 * @param {Function} fn
 * @api public
 */

Store.prototype.load = function(sid, fn){
  var self = this;
  this.get(sid, function(err, sess){
    if (err) { debug('failed to get %s',sid); return fn(err); }
    if (!sess) { debug('no session for %s',sid); return fn(); }
    var req = { sessionID: sid, sessionStore: self };
    sess = self.createSession(req, sess); // recreate prototypes on persisted data
    fn(null, sess);
  });
};

/**
 * Create session from JSON `sess` data.
 *
 * @param {IncomingRequest} req
 * @param {Object} sess
 * @return {Session}
 * @api private
 */

Store.prototype.createSession = function(req, sess){
  var expires = sess.cookie.expires
    , orig = sess.cookie.originalMaxAge;
  sess.cookie = new Cookie(sess.cookie);
  if ('string' === typeof expires) { sess.cookie.expires = new Date(expires); }
  sess.cookie.originalMaxAge = orig;
  req.session = new Session(req, sess);
  return req.session;
};
