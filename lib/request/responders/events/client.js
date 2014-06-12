// Tell the browser how to respond to incoming events
var EventEmitter2, ss;

EventEmitter2 = require('eventemitter2').EventEmitter2;

ss = require('socketstream');

module.exports = function(responderId, config, send) {
  var EE2;
  EE2 = new EventEmitter2;

  // Expose the Event Emitter on 'ss.event' so it can be used in applications   
  ss.registerApi('event', EE2);

  // RECEIVING
  return ss.message.on(responderId, function(msg, meta) {
    var args, ee, obj;
    obj = JSON.parse(msg);              // events are sent as JSON messages
    args = [obj.e];                     // first param is the event name
    args = args.concat(obj.p);          // add n params
    (meta != null) && args.push(meta);  // last param is optional meta data (e.g. what channel was this sent to)

    // Select event emitter based on whether this is an internal system event or application event
    ee = obj.e && obj.e.substr(0, 5) === '__ss:' && ss.server || EE2;

    // Emit event
    return ee.emit.apply(ee, args);
  });
};
