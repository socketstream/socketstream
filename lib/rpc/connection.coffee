# Internal RPC Connection
# -----------------------
# Very simple wrapper to provide asynchronous RPC requests with callbacks. Can utilize multiple transports (ZeroMQ or internal EventEmitters)
# Incoming replies are matched with outgoing requests via the message 'id' which must be passed through from the Server to Client
# Inspired by http://groups.google.com/group/json-rpc/web/json-rpc-2-0 but documented in /doc/guide/rpc_spec.md

class Connection

  constructor: ->
    @transport_type = detectTransport()
    @transport_klass = require("./transports/#{@transport_type}.coffee")
    @debug = false


class exports.Client extends Connection

  constructor: (@name = 'default') ->
    super()
    @transport = new @transport_klass.Client
    @transport.connect(@name)

    # Each client gets it's own request numbers and callback stack
    @request_num = 0
    @stack = {}
    
    # Listen for incoming responses
    @transport.listen (obj) =>

      # Output message for debugging
      @debug && console.log("RPC Client: Msg in via #{@transport_type} transport:", obj)
  
      # All messages in MUST include an ID field containing the same number contained in the request
      if obj.id
        @stack[obj.id](obj)
        delete @stack[obj.id]
      else
        throw new Error("Invalid RPC async response. An 'id' field must be provided")

  send: (obj, cb) ->

    throw new Error('Message to RPC client must be an object') unless typeof(obj) == 'object'
    
    # Callbacks are optional. Sometimes you just want to send a command and not care about a response
    if cb 
      obj.id = ++@request_num
      @stack[obj.id] = cb

    # Append version number and client name
    obj.version = SS.internal.rpc.version
    obj.origin = @name

    # Output message for debugging
    @debug && console.log("RPC Client: Msg to be sent via #{@transport_type} transport:", obj)

    # Send to back end
    @transport.send(obj)

    # Return original message object sent
    obj


class exports.Server extends Connection

  constructor: ->
    super()
    @transport = new @transport_klass.Server
    @transport.connect()
  
  listen: (cb) ->

    # Listen for incoming requests
    @transport.listen (obj, transport_cb) =>

      # Silently drop any messages confirming to another RPC version (allows staggered upgrades)
      return false unless obj.version == SS.internal.rpc.version

      # Output message for debugging
      @debug && console.log("RPC Server: Msg in via #{@transport_type}:", obj)

      cb obj, transport_cb


class exports.Publisher extends Connection

  constructor: ->
    super()
    @transport = new @transport_klass.Publisher
    @transport.connect()

  send: (message_type, message) ->
    @transport.send message_type, message


class exports.Subscriber extends Connection

  constructor: ->
    super()
    @transport = new @transport_klass.Subscriber
    @transport.connect()

  listen: (cb) ->
    @transport.listen cb


# PRIVATE

# If ZeroMQ is present, use it, else fallback on the internal EventEmitter
# In the near future we will support the child_process JSON API in Node 0.5
detectTransport = ->
  SS.internal.zmq && 'zeromq' || 'internal'

