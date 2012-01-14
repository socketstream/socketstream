# RPC - server side

apiTree = require('apitree')

exports.init = (root, messagePrefix, session, ss) ->
  
  dir = root + '/server/rpc/actions'
  api = apiTree.createApiTree(dir)

  # Load inbuilt and custom middleware
  middleware = require('./middleware').init(root, session, ss)

  message = (obj) ->
    messagePrefix + '§'+ JSON.stringify(obj)

  request: (msg, meta, socket) ->
    try

      # RPC responder uses JSON both ways
      obj = JSON.parse(msg)

      # Expand fields so they're easier to work with
      request = {method: obj.m, params: obj.p, id: obj.id, socketId: meta.socketId, sessionId: meta.sessionId, transport: meta.transport}
    
      # Log
      msgLogName = "rpc:#{request.id}".grey
      console.log('→'.cyan, msgLogName, request.method)

      # Seperate the method name into namespace
      methodAry = request.method.split('.')
      methodName = methodAry.pop()

      # Get the correct module from the Api Tree
      file = getBranchFromTree(api, methodAry)

      throw new Error("Unable to find '#{request.method}' action module") unless file.actions

      # Middleware stack
      stack = []

      # Add middleware if exists
      stack = file.before(middleware) if file.before?
      stack = [stack] unless stack instanceof Array

      # Create callback
      cb = ->
        args = Array.prototype.slice.call(arguments)
        obj = {id: request.id, p: args, e: request.error}
        console.log '←'.green, msgLogName, request.method
        socket message(obj)

      # Execute method at the end of the stack
      main = (req, res, next) ->

        # Find the method we're calling
        method = file.actions(req, res, ss)[methodName]

        throw new Error("Unable to find '#{request.method}' method in exports.actions") unless method?

        # Execute method
        method.apply(method, req.params)

      # Add RPC call to bottom of middleware stack
      stack.push(main)

      exec = (req, res, i = 0) ->
        stack[i].call stack, req, res, ->
          exec(req, res, i + 1)

      # Execute stack
      exec(request, cb)

    catch e
      name = 'Error: ' + e.message
      console.log "->".red, msgLogName, request.method, name.red
      obj = {id: request.id, e: {message: e.message}}
      socket message(obj)


# Private

getBranchFromTree = (tree, ary, index = null, i = 0) ->
  index = (ary.length) unless index?
  return tree if i == index
  arguments.callee tree[ary[i]], ary, index, ++i
