# RPC Server-side Request Handler
# -------------------------------
# The RPC handler is only interested in receiving a req object and calling back the res function with (err, response)
# It does not care HOW this request handler can be accessed, how to serialize incoming/outgoing messages,
# or how that interface should deal with errors - that's the job of the interface

pathlib = require('path')
apiTree = require('apitree')

exports.init = (root, messagePrefix, middleware, ss) ->
  
  dir = pathlib.join(root, 'server/rpc')
  api = apiTree.createApiTree(dir)

  request = (req, res) ->
    try

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
      throw new Error("Unable to find an 'exports.actions' function in #{req.method}'") unless file.actions

      # REMOVE_BEFORE_0.3.0 : Throw error if using old-style middleware API
      throw new Error("Important! The RPC middleware API changed in 0.3 alpha3. Please see https://github.com/socketstream/socketstream/blob/master/HISTORY.md") if file.before
    
      # Create callback to send to interface
      cb = ->
        args = Array.prototype.slice.call(arguments)
        res(null, args)

      # Get hold of available actions and populate middleware
      actions = file.actions(req, cb, ss)

      # Execute method at the end of the stack
      main = (request, response, next) ->
        try
          # Find the action we're calling
          method = actions[methodName]

          # Warn if this action doesn't exist
          throw new Error("Unable to find '#{req.method}' method in exports.actions") unless method?

          # Execute action
          method.apply(method, request.params)

        catch e
          res(e, null)

      # Add RPC call to bottom of middleware stack
      stack.push(main)

      exec = (req, res, i = 0) ->
        stack[i].call stack, req, res, ->
          exec(req, res, i + 1)

      # Execute stack
      exec(req, cb)

    catch e
      # Send any errors back to the interface for it to deal with
      res(e, null)



# Private

getBranchFromTree = (tree, ary, index = null, i = 0) ->
  index = (ary.length) unless index?
  return tree if i == index
  arguments.callee tree[ary[i]], ary, index, ++i
