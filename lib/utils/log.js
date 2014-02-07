'use strict';
/**
 * @ngdoc service
 * @name utils.log:log
 * @function
 *
 * @description
 * Contains method stubs for logging to console (by default) or
 * whatever logging provider you choose.
 */

/**
 * @ngdoc service
 * @name utils.log#debug
 * @methodOf utils.log:log
 * @function
 *
 * @description
 * Debug level logging, silent by default. Override by assigning a
 * function that takes the same parameters as console.log:
 * ```
 * var ss = require('socketstream');
 * ss.api.log.debug = console.log;
 * ```
 *
 * @example
 * ```
 * ss.api.log.debug("Something fairly trivial happened");
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
 * function that takes the same parameters as console.log.
 *
 * @example
 * ```
 * ss.api.log.info("Just keeping you informed");
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
 * function that takes the same parameters as console.log:
 * ```
 * var ss = require('socketstream'),
 *     winston = require('winston');
 * ss.api.log.warn = winston.warn;
 * ```
 *
 * @example
 * ```
 * ss.api.log.warn("Something unexpected happened!");
 * ```
 */

/**
 * @ngdoc service
 * @name utils.log#error
 * @methodOf utils.log:log
 * @function
 *
 * @description
 * Error level logging, uses console.error by default. Override by assigning a
 * function that takes the same parameters as console.error.
 *
 * @example
 * ```
 * ss.api.log.error("Time to wakeup the sysadmin");
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
