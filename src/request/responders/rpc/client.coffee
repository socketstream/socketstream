# Tell's the browser how to respond to incoming 'rpc' messages

ss = require('socketstream')

numRequests = 0
cbStack = {}

# Default callback
defaultCallback = (x) -> console.log(x)


# SENDING

ss.registerApi 'rpc', ->

  args = Array.prototype.slice.call(arguments)

  # Prepare message
  obj = {}
  obj.m = args[0]            # method
  obj.id = ++numRequests     # unique request id

  # Callback
  lastArg = args[args.length - 1]
  if typeof(lastArg) == 'function'
    obj.p = args.slice(1, (args.length - 1))
    cb = lastArg
  else
    obj.p = args.slice(1)
    cb = defaultCallback

  # Add callback to stack
  cbStack[obj.id] = cb

  # Convert to JSON
  msg = JSON.stringify(obj)

  # Send it!
  ss.send('rpc|' + msg)

  # Always return undefined
  undefined


# RECEIVING

ss.message.on 'rpc', (msg) ->

  obj = JSON.parse(msg)
 
  # If callback
  if obj.id && cb = cbStack[obj.id]
    if obj.e
      console.error 'SocketStream RPC server error:', obj.e.message
    else
      cb.apply(cb, obj.p)
    delete cbStack[obj.id]

