var EE2, EventEmitter2, ss;

EventEmitter2 = require('eventemitter2').EventEmitter2;

ss = require('socketstream');

EE2 = new EventEmitter2;

ss.registerApi('event', EE2);

ss.message.on('event', function(msg, meta) {
  var args, ee, obj;
  obj = JSON.parse(msg);
  args = [obj.e];
  args = args.concat(obj.p);
  (meta != null) && args.push(meta);
  ee = obj.e && obj.e.substr(0, 5) === '__ss:' && ss.server || EE2;
  return ee.emit.apply(ee, args);
});
