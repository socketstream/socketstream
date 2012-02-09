# RPC - server side

pathlib = require('path')
apiTree = require('apitree')

exports.init = (root, messagePrefix, middleware, ss) ->
  
  dir = pathlib.join(root, 'server/rpc')
  api = apiTree.createApiTree(dir)

  message = (obj) ->
    messagePrefix + '§'+ JSON.stringify(obj)

  request: (msg, meta, socket) ->
    try

      # Init request stack
      stack = []

      # RPC responder uses JSON both ways
      obj = JSON.parse(msg)

      # Expand fields so they're easier to work with
      req = 
        method:     obj.m
        params:     obj.p
        id:         obj.id
        socketId:   meta.socketId
        sessionId:  meta.sessionId
        transport:  meta.transport

      # Allow middleware to be defined
      req.use = (nameOrModule) ->
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
    
      # Log request to terminal
      msgLogName = "rpc:#{req.id}".grey
      console.log('→'.cyan, msgLogName, req.method)

      # Seperate the method name into namespace
      methodAry = req.method.split('.')
      methodName = methodAry.pop()

      # Get the correct module from the API Tree
      file = getBranchFromTree(api, methodAry)
      throw new Error("Unable to find '#{req.method}' action module") unless file.actions

      # REMOVE_BEFORE_0.3.0 : Throw error if using old-style middleware API
      throw new Error("Important! The RPC middleware API changed in 0.3 alpha3. Please see https://github.com/socketstream/socketstream/blob/master/HISTORY.md") if file.before

      # Create callback
      cb = ->
        args = Array.prototype.slice.call(arguments)
        obj = {id: req.id, p: args, e: req.error}
        console.log('←'.green, msgLogName, req.method)
        socket message(obj)
    
      # Get hold of available actions and populate middleware
      actions = file.actions(req, cb, ss)

      # Execute method at the end of the stack
      main = (req, res, next) ->

        # Find the action we're calling
        method = actions[methodName]

        # Warn if this action doesn't exist
        throw new Error("Unable to find '#{req.method}' method in exports.actions") unless method?

        # Execute action
        method.apply(method, req.params)

      # Add RPC call to bottom of middleware stack
      stack.push(main)

      exec = (req, res, i = 0) ->
        stack[i].call stack, req, res, ->
          exec(req, res, i + 1)

      # Execute stack
      exec(req, cb)

    catch e
      name = 'Error: ' + e.message
      console.log('→'.red, msgLogName, req.method, name.red)
      obj = {id: req.id, e: {message: e.message}}
      socket message(obj)


# Private

getBranchFromTree = (tree, ary, index = null, i = 0) ->
  index = (ary.length) unless index?
  return tree if i == index
  arguments.callee tree[ary[i]], ary, index, ++i
