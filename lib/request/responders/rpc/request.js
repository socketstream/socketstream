// RPC Server-side Request Handler
// -------------------------------
// The RPC handler is only interested in receiving a req object and calling back the res function with (err, response)
// It does not care HOW this request handler is accessed, how to serialize incoming/outgoing messages,
// or how to report errors - that's the job of the interface


var apiTree, getBranchFromTree, pathlib;

pathlib = require('path');

apiTree = require('apitree');

module.exports = function(ss, middleware) {
  var api, dir, request;
  dir = pathlib.join(ss.root, 'server/rpc');
  api = apiTree.createApiTree(dir);
  return request = function(req, res) {
    var actions, cb, exec, file, main, methodAry, methodName, stack;

    // Initial error checking    
    if (!(req.method && typeof req.method === 'string' && req.method.indexOf('.') > 0)) {
      throw new Error("No action provided. Action names must be a string separated by dots/periods (e.g. 'message.send')");
    }
    if (!(req.params && req.params instanceof Array)) {
      throw new Error("Params must be supplied as an Array");
    }

    // Init request stack    
    stack = [];

    // Allow middleware to be defined    
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

    // Separate the method name into namespace
    methodAry = req.method.split('.');
    methodName = methodAry.pop();

    // Get the correct module from the API Tree    
    file = getBranchFromTree(api, methodAry);
    if (!file) {
      throw new Error("Unable to find '" + req.method + "' file");
    }
    if (!file.actions) {
      throw new Error("Unable to find an 'exports.actions' function for '" + req.method + "'");
    }
    if (typeof file.actions !== 'function') {
      throw new Error("'exports.actions' function for '" + req.method + "' must be a function");
    }

    // Create callback to send to interface    
    cb = function() {
      var args;
      args = Array.prototype.slice.call(arguments);
      return res(null, args);
    };

    // Get hold of available actions and populate middleware    
    actions = file.actions(req, cb, ss);

    // Execute method at the end of the stack    
    main = function() {
      // Find the action we're calling
      var method;
      method = actions[methodName];

      // Warn if this action doesn't exist      
      if (method == null) {
        return res(new Error("Unable to find '" + req.method + "' method in exports.actions"));
      }
      if (typeof method !== 'function') {
        return res(new Error("The '" + req.method + "' method in exports.actions must be a function"));
      }

      // Execute action      
      return method.apply(method, req.params);
    };

    // Add RPC call to bottom of middleware stack    
    stack.push(main);
    exec = function(request, res, i) {
      if (i == null) {
        i = 0;
      }
      return stack[i].call(stack, req, res, function() {
        return exec(req, res, i + 1);
      });
    };

    // Execute stack    
    return exec(req, cb);
  };
};


// Private

getBranchFromTree = function(tree, ary, index, i) {
  if (index == null) {
    index = null;
  }
  if (i == null) {
    i = 0;
  }
  if (index == null) {
    index = ary.length;
  }
  if (i === index) {
    return tree;
  }
  return arguments.callee(tree[ary[i]], ary, index, ++i);
};
