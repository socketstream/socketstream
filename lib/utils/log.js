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
 * @ngdoc function
 * @name ss.log#trace
 * @methodOf ss.log:log
 * @function
 * @description
 * Trace function calls in socketstream and plugins. By default nothing is done.
 * If you want to switch on tracing override the `trace` method.
 * ```
 * var ss = require('socketstream');
 * ss.api.log.trace = function() {
 * console.log.apply(console,arguments);
 * };
 * ```
 */
exports.trace = function() {
};

/**
 * @ngdoc function
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
exports.debug = console.log;

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
exports.info = console.log;

/**
 * @ngdoc function
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
exports.warn = console.log;


/**
 * @ngdoc function
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
exports.error = console.error;

var nextClientIssue = (new Date()).getTime();

exports.clientIssue = function clientIssue(client,options,err,more) {
  var info = [''];
  if (options.serveDebugInfo) {
    err.userInfo = info;
  }
  info.push(err.message);
  info.push('client='+client.id);
  if (err.stack) {
    info = info.concat(err.stack.split('\n').splice(1));
  }
  if (more) {
    info.push('more:');
    info.push(JSON.stringify(more));
  }

  var number = nextClientIssue++;

  Object.defineProperty(err, 'userInfoHTML', {
    get: function() {
      return this.userInfo? this.userInfo.join('<br>') : ' issue='+number;
    }
  });
  Object.defineProperty(err, 'userInfoText', {
    get: function() {
      return this.userInfo? this.userInfo.join('\n') : ' issue='+number;
    }
  });

  this.error(('Couldn\'t serve client '+client.name+',').red, 'issue='+number, info.join('\n'));

  return number;
};

