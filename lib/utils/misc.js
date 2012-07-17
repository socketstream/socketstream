// Adapted from http://www.broofa.com/Tools/Math.uuid.js
exports.randomString = function (len) {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  var uuid = [];
  var radix = chars.length;
  for (var i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
  return uuid.join('');
};

// Parse incoming websocket messages into message type and contents
exports.parseWsMessage = function (msg) {
  var i;
  if ((i = msg.indexOf('|')) > 0) {
    return [msg.substr(0, i), msg.substr(i+1)];
  } else {
    throw new Error('Invalid message');
  }
};

// Taken from underscore.js
exports.extend = function (obj) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var prop in source) {
      obj[prop] = source[prop];
    }
  }
  return obj;
};

// Useful for declaring default parameter
exports.defaults = function (args, defaults) {
  return exports.extend({}, defaults, args);
};
