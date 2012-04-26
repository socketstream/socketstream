var apiTree, pathlib;

pathlib = require('path');

apiTree = require('apitree');

module.exports = function(ss, config) {
  var customDir, internal;
  customDir = pathlib.join(ss.root, 'server/middleware');
  internal = require('./internal')(ss);
  return {
    load: function() {
      var k, stack, v;
      stack = pathlib.existsSync(customDir) && apiTree.createApiTree(customDir) || {};
      for (k in internal) {
        v = internal[k];
        stack[k] = v;
      }
      return stack;
    }
  };
};
