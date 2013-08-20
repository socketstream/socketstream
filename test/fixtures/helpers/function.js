"use strict";

var toArray;

toArray = function(enumerable) {
  return Array.prototype.slice.call(enumerable);
};

Function.prototype.curry = function() {
  var args, __method;
  if (arguments.length < 1) {
    return this;
  }
  __method = this;
  args = toArray(arguments);
  return function() {
    return __method.apply(this, args.concat(toArray(arguments)));
  };
};
