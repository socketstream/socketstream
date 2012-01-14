# Tell the browser how to respond to incoming events

EE2 = new EventEmitter2

window.SocketStream.registerApi 'event', EE2


# RECEIVING

SocketStream.message.on 'event', (msg, meta) ->

  obj = JSON.parse(msg)       # events are sent as JSON messages
  args = [obj.e]              # first param is the event name
  args = args.concat(obj.p)   # add n params
  meta? && args.push(meta)    # last param is optional meta data (e.g. what channel was this sent to)

  EE2.emit.apply(EE2, args)
