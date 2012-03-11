# Tell the browser how to respond to incoming events

EventEmitter2 = require('eventemitter2').EventEmitter2
ss = require('socketstream')

EE2 = new EventEmitter2

ss.registerApi('event', EE2)


# RECEIVING

ss.message.on 'event', (msg, meta) ->

  obj = JSON.parse(msg)       # events are sent as JSON messages
  args = [obj.e]              # first param is the event name
  args = args.concat(obj.p)   # add n params
  meta? && args.push(meta)    # last param is optional meta data (e.g. what channel was this sent to)

  # Select event emitter based on whether this is an internal system event or application event
  ee = obj.e && obj.e.substr(0,5) == '__ss:' && ss.server || EE2

  # Emit event
  ee.emit.apply(ee, args)
