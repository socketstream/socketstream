'use strict';
/**
 * @ngdoc service
 * @name utils.log#debug
 * @methodOf utils.log:log
 * @function
 *
 * @description
 * Debug level logging, silent by default. Override by assigning a
 * function that takes the same parameters as console.log. Example:
 * ```
 * var ss = require('socketstream');
 * ss.log.debug = console.log;
 * ```
 */

/**
 * @ngdoc service
 * @name utils.log#info
 * @methodOf utils.log:log
 * @function
 *
 * @description
 * Info level logging, silent by default. Override by assigning a
 * function that takes the same parameters as console.log. Example:
 * ```
 * var ss = require('socketstream');
 * ss.log.info = console.log;
 * ```
 */

/**
 * @ngdoc service
 * @name utils.log#warn
 * @methodOf utils.log:log
 * @function
 *
 * @description
 * Warn level logging, uses console.log by default. Override by assigning a
 * function that takes the same parameters as console.log. Example:
 * ```
 * var ss = require('socketstream'),
 *     winston = require('winston');
 * ss.log.warn = winston.warn;
 * ```
 */

/**
 * @ngdoc service
 * @name utils.log#warn
 * @methodOf utils.log:log
 * @function
 *
 * @description
 * Warn level logging, uses console.error by default. Override by assigning a
 * function that takes the same parameters as console.error. Example:
 * ```
 * var ss = require('socketstream'),
 *     winston = require('winston');
 * ss.log.error = winston.error;
 * ```
 */
module.exports = (function() {
  var l = function() {
    var args = [].slice.call(arguments);
    args.unshift("FIXME");
    l.info.apply(this, args);
  };
  l.debug = function(){};
  l.info = function(){};
  l.warn = console.log;
  l.error = console.error;
  return l;
}())
