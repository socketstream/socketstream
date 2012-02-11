var apiTree, getBranchFromTree, pathlib;

pathlib = require('path');

apiTree = require('apitree');

exports.init = function(root, messagePrefix, middleware, ss) {
  var api, dir, message;
  dir = pathlib.join(root, 'server/rpc');
  api = apiTree.createApiTree(dir);
  message = function(obj) {
    return messagePrefix + '§' + JSON.stringify(obj);
  };
  return {
    request: function(msg, meta, socket) {
      var actions, cb, exec, file, main, methodAry, methodName, msgLogName, name, obj, req, stack;
      try {
        stack = [];
        obj = JSON.parse(msg);
        req = {
          method: obj.m,
          params: obj.p,
          id: obj.id,
          socketId: meta.socketId,
          sessionId: meta.sessionId,
          transport: meta.transport
        };
        req.use = function(nameOrModule) {
          var args, fn, middlewareAry, mw;
          args = Array.prototype.slice.call(arguments);
          mw = typeof nameOrModule === 'function' ? nameOrModule : (middlewareAry = nameOrModule.split('.'), getBranchFromTree(middleware, middlewareAry));
          if (mw) {
            fn = mw.apply(mw, args.splice(1));
            return stack.push(fn);
          } else {
            throw new Error("Middleware function '" + nameOrModule + "' not found. Please reference internal or custom middleware as a string (e.g. 'session' or 'user.checkAuthenticated') or pass a function/module");
          }
        };
        msgLogName = ("rpc:" + req.id).grey;
        console.log('→'.cyan, msgLogName, req.method);
        methodAry = req.method.split('.');
        methodName = methodAry.pop();
        file = getBranchFromTree(api, methodAry);
        if (!file.actions) {
          throw new Error("Unable to find '" + req.method + "' action module");
        }
        if (file.before) {
          throw new Error("Important! The RPC middleware API changed in 0.3 alpha3. Please see https://github.com/socketstream/socketstream/blob/master/HISTORY.md");
        }
        cb = function() {
          var args;
          args = Array.prototype.slice.call(arguments);
          obj = {
            id: req.id,
            p: args,
            e: req.error
          };
          console.log('←'.green, msgLogName, req.method);
          return socket(message(obj));
        };
        actions = file.actions(req, cb, ss);
        main = function(req, res, next) {
          var method;
          method = actions[methodName];
          if (method == null) {
            throw new Error("Unable to find '" + req.method + "' method in exports.actions");
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
        return exec(req, cb);
      } catch (e) {
        name = 'Error: ' + e.message;
        console.log('→'.red, msgLogName, req.method, name.red);
        obj = {
          id: req.id,
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
