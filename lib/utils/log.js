'use strict';
/**
 * @ngdoc service
 * @name ss.log:log
 * @function
 *
 * @description
 * Contains method stubs for logging to console (by default) or
 * whatever logging provider you choose.
 */

/**
 * @ngdoc service
 * @name ss.log#debug
 * @methodOf ss.log:log
 * @function
 *
 * @description
 * Debug level logging, uses console.log by default. Override by assigning a
 * function that takes the same parameters as console.log:
 * ```
 * var ss = require('socketstream');
 * ss.api.log.debug = console.log;
 * ```
 *
 * @example
 * ```
 * ss.log.debug("Something fairly trivial happened");
 * ```
 */

/**
 * @ngdoc service
 * @name ss.log#info
 * @methodOf ss.log:log
 * @function
 *
 * @description
 * Info level logging, uses console.log by default. Override by assigning a
 * function that takes the same parameters as console.log.
 *
 * @example
 * ```
 * ss.log.info("Just keeping you informed");
 * ```
 */

/**
 * @ngdoc service
 * @name ss.log#warn
 * @methodOf ss.log:log
 * @function
 *
 * @description
 * Warn level logging, uses console.log by default. Override by assigning a
 * function that takes the same parameters as console.log:
 * ```
 * var ss = require('socketstream'),
 *     winston = require('winston');
 * ss.log.warn = winston.warn;
 * ```
 *
 * @example
 * ```
 * ss.log.warn("Something unexpected happened!");
 * ```
 */

/**
 * @ngdoc service
 * @name ss.log#error
 * @methodOf ss.log:log
 * @function
 *
 * @description
 * Error level logging, uses console.error by default. Override by assigning a
 * function that takes the same parameters as console.error.
 *
 * @example
 * ```
 * ss.log.error("Time to wakeup the sysadmin");
 * ```
 */
module.exports = (function() {
  var l = function() {
    var args = [].slice.call(arguments);
    args.unshift('FIXME');
    l.info.apply(this, args);
  };
  l.debug = console.log;
  l.info = console.log;
  l.warn = console.log;
  l.error = console.error;
  return l;
}())
