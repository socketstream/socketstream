/*!
 * uid-safe
 * Copyright(c) 2014 Jonathan Ong
 * MIT Licensed
 */


/**
 * Module dependencies.
 * @private
 */

var Promise
var pseudoRandomBytes = require('crypto').pseudoRandomBytes
var escape = require('base64-url').escape

/**
 * Module exports.
 */

module.exports = uid
module.exports.sync = uidSync

/**
 * Create a unique ID.
 *
 * @param {number} length
 * @param {function} [callback]
 * @return {Promise}
 * @public
 */

function uid(length, callback) {
  if (callback) {
    return generateUid(length, callback)
  }

  if (!Promise) {
    Promise = require('native-or-bluebird')
  }

  return new Promise(function (resolve, reject) {
    generateUid(length, function (err, str) {
      if (err) return reject(err)
      resolve(str)
    })
  })
}

/**
 * Create a unique ID sync.
 *
 * @param {number} length
 * @return {string}
 * @public
 */

function uidSync(length) {
  return toString(pseudoRandomBytes(length))
}

/**
 * Generate a unique ID string.
 *
 * @param {number} length
 * @param {function} callback
 * @private
 */

function generateUid(length, callback) {
  pseudoRandomBytes(length, function (err, buf) {
    if (err) return cb(err)
    callback(null, toString(buf))
  })
}

/**
 * Change a Buffer into a string.
 *
 * @param {Buffer} buf
 * @return {string}
 * @private
 */

function toString(buf) {
  return escape(buf.toString('base64'))
}
