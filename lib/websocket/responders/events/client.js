var EE2;

EE2 = new EventEmitter2;

window.SocketStream.registerApi('event', EE2);

SocketStream.message.on('event', function(msg, meta) {
  var args, obj;
  obj = JSON.parse(msg);
  args = [obj.e];
  args = args.concat(obj.p);
  (meta != null) && args.push(meta);
  return EE2.emit.apply(EE2, args);
});
