// Request Middleware
// ------------------
// Allows incoming requests to be pre-processed, transformed, or sent elsewhere
'use strict';

var pathlib = require('path'),
    fs = require('fs'),
    apiTree = require('apitree');

module.exports = function(ss) {
  var customDir = pathlib.join(ss.root, 'server/middleware');

  // Load internal middleware
  var internal = require('./internal')(ss);
  return {

    // Return API
    load: function() {

      // Load custom middleware      
      stack = existslib.existsSync(customDir) && apiTree.createApiTree(customDir) || {};

      // Append internal/default middleware
      for (var k in internal) {
        stack[k] = internal[k];
      }
      return stack;
    }
  };
};
