
window.SocketStream.registerApi('telemetry', function() {
  var args, msg;
  args = Array.prototype.slice.call(arguments);
  msg = args.join('±');
  SocketStream.transport.send('tel|' + msg);
  return;
});
