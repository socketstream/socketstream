/*!
 * response-time
 * Copyright(c) 2011 TJ Holowaychuk
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2014 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module dependencies
 */

var deprecate = require('depd')('response-time')
var onHeaders = require('on-headers')

/**
 * Reponse time:
 *
 * Adds the `X-Response-Time` header displaying the response
 * duration in milliseconds.
 *
 * @param {object} [options]
 * @param {number} [options.digits=3]
 * @return {function}
 * @api public
 */

module.exports = function responseTime(options) {
  if (typeof options === 'number') {
    // back-compat single number argument
    deprecate('number argument: use {digits: ' + JSON.stringify(options) + '} instead')
    options = { digits: options }
  }

  options = options || {}

  // response time digits
  var digits = options.digits !== undefined
    ? options.digits
    : 3

  // header name
  var header = options.header || 'X-Response-Time'

  // display suffix
  var suffix = options.suffix !== undefined
    ? Boolean(options.suffix)
    : true

  return function responseTime(req, res, next) {
    var startAt = process.hrtime()

    onHeaders(res, function () {
      if (this.getHeader(header)) {
        return
      }

      var diff = process.hrtime(startAt)
      var ms = diff[0] * 1e3 + diff[1] * 1e-6
      var val = ms.toFixed(digits)

      if (suffix) {
        val += 'ms'
      }

      this.setHeader(header, val)
    })

    next()
  }
}
