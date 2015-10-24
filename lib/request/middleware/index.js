// Request Middleware
// ------------------
// Allows incoming requests to be pre-processed, transformed, or sent elsewhere
'use strict';

var pathlib = require('path'),
    fs = require('fs'),
    apiTree = require('apitree');

module.exports = function(ss) {
  // Load internal middleware
  var internal = require('./internal')(ss);
  return {

    // Return API
    load: function() {

      var customDir = pathlib.join(ss.root, 'server/middleware');

      // Load custom middleware
      var stack = fs.existsSync(customDir) && apiTree.createApiTree(customDir) || {};

      // Append internal/default middleware
      for (var k in internal) {
        stack[k] = internal[k];
      }
      return stack;
    }
  };
};
