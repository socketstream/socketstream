'use strict';

/**
 * Counters we use to track how many
 * assertions to expect vs got
 */
var expected = 0,
    actual   = 0;

/**
 * Used to specify how many assertions we expect to call
 */
function expect (n) {
    expected = n;
}

/**
 * Used to reset the counters
 */
function reset () {
    actual   = 0;
    expected = 0;
}



/**
 * Used to check that the assertions have run
 * @param  {Function} next callback
 * @return {Void}
 */
function check (next) {
    setTimeout(function() {
        if (expected !== actual) {
            var err = new Error('Assertion count error (expected: '+expected+', got: '+actual+') ');
            if (typeof next === 'function') {
              next(err);
            } else {
              throw err;
            }
        } else {
            if (typeof next === 'function') { next() }
        }
    }, 1);
}

/**
 * @return {Void}         [description]
 */
function andCheck () {
    actual++;
}

/*
    Do not use 'Object.prototype = andCheck',
    it will cause error in cases of using 'for (.. in...)'' loop for objects
    So we assign `andCheck` as a not-enumerable value
*/
Object.defineProperty(Object.prototype, "andCheck", {value: andCheck, enumerable: false})

/**
 * Expose the Public API
 */
module.exports = {
    expect      : expect,
    check       : check,
    reset       : reset
};