# Tell's the browser how to respond to incoming 'tel' messages

window.SocketStream.registerApi 'telemetry', ->

  args = Array.prototype.slice.call(arguments)
  
  msg = args.join('±')

  # Send it!
  SocketStream.transport.send('tel§' + msg)

  # Always return undefined
  undefined
