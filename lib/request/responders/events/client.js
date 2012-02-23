var EE2;

EE2 = new EventEmitter2;

window.SocketStream.registerApi('event', EE2);

SocketStream.message.on('event', function(msg, meta) {
  var args, ee, obj;
  obj = JSON.parse(msg);
  args = [obj.e];
  args = args.concat(obj.p);
  (meta != null) && args.push(meta);
  ee = obj.e && obj.e.substr(0, 5) === '__ss:' && SocketStream.event || EE2;
  return ee.emit.apply(ee, args);
});
