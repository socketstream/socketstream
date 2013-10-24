/*jslint bitwise: true*/

"use strict";

/**
 * Adapted from http://www.broofa.com/Tools/Math.uuid.js
 * @param  {tring}  len
 * @return {String}     uuid string
 */
exports.randomString = function (len) {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
      uuid  = [],
      radix = chars.length,
      i;

  for (i = 0; i < len; i++) {
    uuid[i] = chars[0 | Math.random()*radix];
  }
  return uuid.join('');
};

/**
 * Parse incoming websocket messages into message type and contents
 * @param  {String} msg Message to parse
 * @return {Array}      Array, where [0] is message type, [1] is message's body
 */
exports.parseWsMessage = function (msg) {
  var i;
  if ((i = msg.indexOf('|')) > 0) {
    return [msg.substr(0, i), msg.substr(i+1)];
  } else {
    throw new Error('Invalid message');
  }
};

/**
 * Taken from underscore.js
 * @param  {Object} obj [description]
 * @return {Object}     Extended object
 */
exports.extend = function (obj) {
  var source,
      prop,
      i;

  for (i = 1; i < arguments.length; i++) {
    source = arguments[i];
    for (prop in source) {
      if (source.hasOwnProperty(prop)) {
        obj[prop] = source[prop];
      }
    }
  }
  return obj;
};

/**
 * Useful for declaring default parameter
 * @param  {Object} args
 * @param  {Object} defaults
 * @return {Object}
 */
exports.defaults = function (args, defaults) {
  return exports.extend({}, defaults, args);
};
