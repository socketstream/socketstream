var apiTree, pathlib;

pathlib = require('path');

apiTree = require('apitree');

exports.init = function(root, ss) {
  var customDir, internal;
  customDir = pathlib.join(root, 'server/middleware');
  internal = require('./internal').init(root, ss);
  return {
    load: function() {
      var k, stack, v;
      if (pathlib.existsSync(customDir)) {
        stack = apiTree.createApiTree(customDir);
        for (k in internal) {
          v = internal[k];
          stack[k] = v;
        }
      }
      return stack;
    }
  };
};
