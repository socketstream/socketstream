// Request Middleware
// ------------------
// Allows incoming requests to be pre-processed, transformed, or sent elsewhere
'use strict';

var apiTree, pathlib, fs;

pathlib = require('path');
fs= require('fs');

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
      stack = fs.existsSync(customDir) && apiTree.createApiTree(customDir) || {};

      // Append internal/default middleware
      for (k in internal) {
        v = internal[k];
        stack[k] = v;
      }
      return stack;
    }
  };
};
