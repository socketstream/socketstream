# RPC Server-side Request Handler
# -------------------------------
# The RPC handler is only interested in receiving a req object and calling back the res function with (err, response)
# It does not care HOW this request handler is accessed, how to serialize incoming/outgoing messages,
# or how to report errors - that's the job of the interface

pathlib = require('path')
apiTree = require('apitree')

module.exports = (ss, middleware) ->
  
  dir = pathlib.join(ss.root, 'server/rpc')
  api = apiTree.createApiTree(dir)

  request = (req, res) ->
    
    # Initial error checking
    throw new Error("No action provided. Action names must be a string separated by dots/periods (e.g. 'message.send')") unless req.method && typeof(req.method) == 'string' && req.method.indexOf('.') > 0
    throw new Error("Params must be supplied as an Array") unless req.params && req.params instanceof Array

    # Init request stack
    stack = []

    # Allow middleware to be defined
    req.use = (nameOrModule) ->
      try
        args = Array.prototype.slice.call(arguments)

        mw = if typeof(nameOrModule) == 'function'
          nameOrModule
        else
          middlewareAry = nameOrModule.split('.')
          getBranchFromTree(middleware, middlewareAry)
        
        if mw
          fn = mw.apply(mw, args.splice(1))
          stack.push(fn)
        else
          throw new Error("Middleware function '#{nameOrModule}' not found. Please reference internal or custom middleware as a string (e.g. 'session' or 'user.checkAuthenticated') or pass a function/module")
      catch e
        res(e, null)

    # Separate the method name into namespace
    methodAry = req.method.split('.')
    methodName = methodAry.pop()

    # Get the correct module from the API Tree
    file = getBranchFromTree(api, methodAry)
    throw new Error("Unable to find '#{req.method}' file") unless file
    throw new Error("Unable to find an 'exports.actions' function for '#{req.method}'") unless file.actions
    throw new Error("'exports.actions' function for '#{req.method}' must be a function") unless typeof(file.actions) == 'function'

    # Create callback to send to interface
    cb = ->
      args = Array.prototype.slice.call(arguments)
      res(null, args)

    # Get hold of available actions and populate middleware
    actions = file.actions(req, cb, ss)

    # Execute method at the end of the stack
    main = ->
      # Find the action we're calling
      method = actions[methodName]

      # Warn if this action doesn't exist
      return res(new Error("Unable to find '#{req.method}' method in exports.actions")) unless method?
      return res(new Error("The '#{req.method}' method in exports.actions must be a function")) unless typeof(method) == 'function'

      # Execute action
      method.apply(method, req.params)

    # Add RPC call to bottom of middleware stack
    stack.push(main)

    exec = (request, res, i = 0) ->
      stack[i].call stack, req, res, ->
        exec(req, res, i + 1)

    # Execute stack
    exec(req, cb)



# Private

getBranchFromTree = (tree, ary, index = null, i = 0) ->
  index = (ary.length) unless index?
  return tree if i == index
  arguments.callee tree[ary[i]], ary, index, ++i
