var apiTree, getBranchFromTree;

apiTree = require('apitree');

exports.init = function(root, messagePrefix, session, ss) {
  var api, dir, message, middleware;
  dir = root + '/server/rpc/actions';
  api = apiTree.createApiTree(dir);
  middleware = require('./middleware').init(root, session, ss);
  message = function(obj) {
    return messagePrefix + '§' + JSON.stringify(obj);
  };
  return {
    request: function(msg, meta, socket) {
      var cb, exec, file, main, methodAry, methodName, msgLogName, name, obj, request, stack;
      try {
        obj = JSON.parse(msg);
        request = {
          method: obj.m,
          params: obj.p,
          id: obj.id,
          socketId: meta.socketId,
          sessionId: meta.sessionId,
          transport: meta.transport
        };
        msgLogName = ("rpc:" + request.id).grey;
        console.log('→'.cyan, msgLogName, request.method);
        methodAry = request.method.split('.');
        methodName = methodAry.pop();
        file = getBranchFromTree(api, methodAry);
        if (!file.actions) {
          throw new Error("Unable to find '" + request.method + "' action module");
        }
        stack = [];
        if (file.before != null) stack = file.before(middleware);
        if (!(stack instanceof Array)) stack = [stack];
        cb = function() {
          var args;
          args = Array.prototype.slice.call(arguments);
          obj = {
            id: request.id,
            p: args,
            e: request.error
          };
          console.log('←'.green, msgLogName, request.method);
          return socket(message(obj));
        };
        main = function(req, res, next) {
          var method;
          method = file.actions(req, res, ss)[methodName];
          if (method == null) {
            throw new Error("Unable to find '" + request.method + "' method in exports.actions");
          }
          return method.apply(method, req.params);
        };
        stack.push(main);
        exec = function(req, res, i) {
          if (i == null) i = 0;
          return stack[i].call(stack, req, res, function() {
            return exec(req, res, i + 1);
          });
        };
        return exec(request, cb);
      } catch (e) {
        name = 'Error: ' + e.message;
        console.log("->".red, msgLogName, request.method, name.red);
        obj = {
          id: request.id,
          e: {
            message: e.message
          }
        };
        return socket(message(obj));
      }
    }
  };
};

getBranchFromTree = function(tree, ary, index, i) {
  if (index == null) index = null;
  if (i == null) i = 0;
  if (index == null) index = ary.length;
  if (i === index) return tree;
  return arguments.callee(tree[ary[i]], ary, index, ++i);
};
