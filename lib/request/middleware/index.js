var apiTree, pathlib;

pathlib = require('path');

apiTree = require('apitree');

exports.init = function(ss) {
  var customDir, internal;
  customDir = pathlib.join(ss.root, 'server/middleware');
  internal = require('./internal').init(ss);
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
