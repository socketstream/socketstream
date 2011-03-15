// From https://github.com/senchalabs/connect/blob/master/lib/connect/utils.js
var queryString = require('querystring');
exports.parseCookie = function(str){
  var obj = {},
      pairs = str.split(/[;,] */);
  for (var i = 0, len = pairs.length; i < len; ++i) {
      var pair = pairs[i],
          eqlIndex = pair.indexOf('='),
          key = pair.substr(0, eqlIndex).trim().toLowerCase(),
          val = pair.substr(++eqlIndex, pair.length).trim();
      // Quoted values
      if (val[0] === '"') {
          val = val.slice(1, -1);
      }
      // Only assign once
      if (obj[key] === undefined) {
          obj[key] = queryString.unescape(val, true);
      }
  }
  return obj;
};

// Adapted from http://www.broofa.com/Tools/Math.uuid.js
exports.randomString = function (len) {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  var uuid = [];
  radix = chars.length;
  for (var i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
  return uuid.join('');
};

// Recursively traverses an object tree to return the requested variable
exports.getFromTree = function(s_var, ary, index, i) {
  if (index == undefined) index = (ary.length);
  if (i == undefined) i = 0;
  if (i == index) return s_var;
  return arguments.callee(s_var[ary[i]], ary, index, (i + 1));
};

