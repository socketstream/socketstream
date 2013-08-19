// Request Middleware
// ------------------
// Allows incoming requests to be pre-processed, transformed, or sent elsewhere

var apiTree, existslib, pathlib;

pathlib = require('path');

existslib = process.version.split('.')[1] === '6' && require('path') || require('fs');

apiTree = require('apitree');

module.exports = function(ss, config) {
  var customDir, internal;
  customDir = pathlib.join(ss.root, 'server/middleware');

  // Load internal middleware  
  internal = require('./internal')(ss);
  return {

    // Return API    
    load: function() {
      var k, stack, v;

      // Load custom middleware      
      stack = existslib.existsSync(customDir) && apiTree.createApiTree(customDir) || {};

      // Append internal/default middleware
      for (k in internal) {
        v = internal[k];
        stack[k] = v;
      }
      return stack;
    }
  };
};
