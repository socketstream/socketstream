"use strict";

var log = [],
    _stream   = process.stdout,
    old_write = _stream.write; // Reference default write method


/**
 * Hooking function for console.log interception
 *
 * Methods:
 *     .on()
 *     .off()
 *
 * Example:
 *     var logHook = require('logHook.js'),
 *         _logs;
 *
 *     // turning hook on
 *     logHook.on();
 *
 *     // log test message
 *     console.log('test message');
 *
 *     // turning hook off, now we have variable _logs === ['test message']
 *     _logs = logHook.off();
 *
 *
 * @return {function}
 */
module.exports = {
    /**
     * Turns 'console.log' hook on and push all the incomming lines from 'process.stdout' into 'log' variable
     * @return {Void}
     */
    on: function() {
        log = [];

        /* _stream now write with our shiny function */
        _stream.write = function(string) {
            log.push(string.replace(/\n$/, ''));
        };
    },
    /**
     * Turns 'console.log' hook off and returns array with 'process.stdout' lines
     * @return {Array} Module local 'log' variable
     */
    off: function() {
        /* reset to the default write method */
        _stream.write = old_write;
        return log;
    }
}