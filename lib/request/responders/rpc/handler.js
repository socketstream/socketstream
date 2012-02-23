var apiTree, getBranchFromTree, pathlib;

pathlib = require('path');

apiTree = require('apitree');

exports.init = function(root, messagePrefix, middleware, ss) {
  var api, dir, request;
  dir = pathlib.join(root, 'server/rpc');
  api = apiTree.createApiTree(dir);
  return request = function(req, res) {
    var actions, cb, exec, file, main, methodAry, methodName, stack;
    try {
      stack = [];
      req.use = function(nameOrModule) {
        var args, fn, middlewareAry, mw;
        try {
          args = Array.prototype.slice.call(arguments);
          mw = typeof nameOrModule === 'function' ? nameOrModule : (middlewareAry = nameOrModule.split('.'), getBranchFromTree(middleware, middlewareAry));
          if (mw) {
            fn = mw.apply(mw, args.splice(1));
            return stack.push(fn);
          } else {
            throw new Error("Middleware function '" + nameOrModule + "' not found. Please reference internal or custom middleware as a string (e.g. 'session' or 'user.checkAuthenticated') or pass a function/module");
          }
        } catch (e) {
          return res(e, null);
        }
      };
      methodAry = req.method.split('.');
      methodName = methodAry.pop();
      file = getBranchFromTree(api, methodAry);
      if (!file) throw new Error("Unable to find '" + req.method + "' file");
      if (!file.actions) {
        throw new Error("Unable to find an 'exports.actions' function in " + req.method + "'");
      }
      if (file.before) {
        throw new Error("Important! The RPC middleware API changed in 0.3 alpha3. Please see https://github.com/socketstream/socketstream/blob/master/HISTORY.md");
      }
      cb = function() {
        var args;
        args = Array.prototype.slice.call(arguments);
        return res(null, args);
      };
      actions = file.actions(req, cb, ss);
      main = function(request, response, next) {
        var method;
        try {
          method = actions[methodName];
          if (method == null) {
            throw new Error("Unable to find '" + req.method + "' method in exports.actions");
          }
          return method.apply(method, request.params);
        } catch (e) {
          return res(e, null);
        }
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
      return res(e, null);
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
