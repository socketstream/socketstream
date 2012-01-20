var apiTree, pathlib;

pathlib = require('path');

apiTree = require('apitree');

exports.init = function(root, messagePrefix, extensions) {
  var api, dir;
  dir = pathlib.join(root, 'server/rpc/actions');
  api = apiTree.buildApiTree(dir);
  return {
    request: function(msg, meta, socket) {
      var exec, file, main, methodAry, methodName, obj, stack;
      try {
        obj = msg.split('±');
        methodAry = obj[0].split('.');
        methodName = methodAry.pop();
        file = apiTree.getBranch(api, methodAry);
        stack = [];
        main = function(req, res, next) {
          var args, method;
          method = file.actions(res)[methodName];
          args = obj.slice(1);
          return method.apply(method, args);
        };
        stack.push(main);
        exec = function(req, i) {
          if (i == null) i = 0;
          return stack[i].call(stack, req, function() {
            return exec(req, i + 1);
          });
        };
        return exec(obj);
      } catch (e) {
        return console.error(e);
      }
    }
  };
};
