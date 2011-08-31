# ZeroMQ Async Request
# --------------------
# Very simple wrapper around the standard ZMQ library to provide asynchronous RPC requests with callbacks
# Incoming replies are matched with outgoing requests via the message 'id' which must be passed through
# as suggested by http://groups.google.com/group/json-rpc/web/json-rpc-2-0

#msgpack = require('msgpack-0.4')  (Note: I tried this but it made negligible difference, in some cases slower than JSON!)

class exports.Socket

  constructor: (@socket_type = 'xreq', @connect_to = SS.config.cluster.sockets.fe_main, @format = SS.config.cluster.serialization) ->
    @socket = SS.internal.zmq.createSocket(@socket_type)
    @socket.connect @connect_to
        
    @request_num = 0
    @stack = {}
    @debug = false
  
    # Listen for incoming responses
    @socket.on 'message', (data) =>

      # Attempt to parse message
      try
        obj = exports.formats[@format].unpack(data)
        console.log('ZeroMQ socket received:', obj) if @debug
      catch e
        throw new Error("Invalid ZeroMQ async message received. Unable to parse #{@format} message. Reason given: #{e.message}")
  
      # All messages in MUST include an ID field containing the same number contained in the request
      if obj.id
        @stack[obj.id](obj)
        delete @stack[obj.id]
      else
        throw new Error("Invalid ZeroMQ async response. An 'id' field must be provided")

  # First argument must be the message object - e.g. {method: 'sum', params: [4,1,5]}
  # Second argument is optional. It can be an object or array. Use it as a place to store associated data with the request that won't be sent over the wired (e.g. the socket we need to emit the response to)
  # Final argument must be the callback which is also optional (sometimes we just want to send a command and not care about a response)
  send: () ->

    # Ugly but fast. Improvements welcome. Remember store and cb are both optional
    [obj, cb] = arguments
    
    throw new Error('Message to ZeroMQ async wrapper must be an object') unless typeof(obj) == 'object'
    
    # Callbacks are optional. Sometimes you just want to send a command and not care about a response
    if cb 
      obj.id = ++@request_num
      @stack[obj.id] = cb

    console.log('ZeroMQ socket about to serialize message object:', obj) if @debug

    # Pack and send
    msg = exports.formats[@format].pack(obj)
    @socket.send msg

    # Return original message object sent
    obj


# Serialization formats supported
exports.formats =

  json:
    pack: (obj) ->
      JSON.stringify(obj)
    unpack: (msg) ->
      JSON.parse(msg.toString())
  
  msgpack:   
    pack: (obj) ->
      msgpack.pack(obj)
    unpack: (msg) ->
      msgpack.unpack(msg)
