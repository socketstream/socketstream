"use strict";


module.exports = {

    /**
     * Return function name
     *
     * Example:
     *     var f = function myFunctionName() {
     *         return false;
     *     }
     *
     *      getfunctionName(f); // returns 'myFunctionName'
     * @param  {Function} fun Function with the name to return
     * @return {String}       Passed function name
     */
    getfunctionName: function(fun) {
        var ret = fun.toString();
        ret = ret.substr('function '.length);
        ret = ret.substr(0, ret.indexOf('('));
        return ret;
    }
}