'use strict';



// Counters we use to track how many
// assertions to expect vs got
//
var expected = 0;
var actual   = 0;



// Used to specify how many assertions
// we expect to call
//
function expect (n) {
    expected = n;
}



// Used to reset the counters
//
function reset () {
    actual   = 0;
    expected = 0;
};



// Used to check that the assertions
// have run
//
function check (next) {
    setTimeout(function() {
        if (expected !== actual) {
            var err = new Error('Assertion count error (expected: '+expected+', got: '+actual+') ');
            if (typeof next === 'function') { 
              next(err);
            } else {
              throw err;
            };
        } else {
            if (typeof next === 'function') { next() };
        }
    }, 1);
}


Object.prototype.andCheck = function (timeout) {
  actual++;
}



// Expose the Public API
//
module.exports = {
    expect      : expect,
    check       : check,
    reset       : reset
};