# Telemetry - Unfinished. Do not use yet!

apiTree = require('apitree')

exports.init = (root, messagePrefix, extensions) ->

  dir = root + '/server/telemetry'
  api = apiTree.buildApiTree(dir)

  request: (msg, meta, socket) ->
    try
      obj = msg.split('±')

      # Seperate the method name into namespace
      methodAry = obj[0].split('.')
      methodName = methodAry.pop()

      # Get the correct module from the Api Tree
      file = apiTree.getBranch(api, methodAry)

      # Middleware stack
      stack = []

      # Execute method at the end of the stack
      main = (req, res, next) ->

        # Find the method we're calling
        method = file.actions(res)[methodName]

        # Send the args supplied plus the callback 
        args = obj.slice(1)

        # Execute method
        method.apply(method, args)

      # Add main processor to bottom of middleware stack
      stack.push(main)

      exec = (req, i = 0) ->
        stack[i].call stack, req, ->
          exec(req, i + 1)

      # Run Stack
      exec(obj)

    catch e
      console.error e


