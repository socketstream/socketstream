'use strict';



// These are helper methods extracted from here: 
// http://stackoverflow.com/questions/9210542/node-js-require-cache-possible-to-invalidate



/**
 * Removes a module from the cache
 * @param  {String} moduleName the path of the module
 * @return {Void}
 */
require.uncache = function (moduleName) {
    // Run over the cache looking for the files
    // loaded by the specified module name
    require.searchCache(moduleName, function (mod) {
        delete require.cache[mod.id];
    });
};



/**
 * Runs over the cache to search for all the cached
 * files
 * @param  {String}     moduleName  the path of the module
 * @param  {Function}   next        callback
 * @return {Void}
 */
require.searchCache = function (moduleName, callback) {
    // Resolve the module identified by the specified name
    var mod = require.resolve(moduleName);

    // Check if the module has been resolved and found within
    // the cache
    if (mod && ((mod = require.cache[mod]) !== undefined)) {
        // Recursively go over the results
        (function run(mod) {
            // Go over each of the module's children and
            // run over it
            mod.children.forEach(function (child) {
                run(child);
            });

            // Call the specified callback providing the
            // found module
            callback(mod);
        })(mod);
    }
};



/**
 * Expose the Public API
 */
module.exports = require;