"use strict"

exports.init = function(name) {
  return {
    name: name,
    prefix: function() {
      return "<" + this.name + "::prefix>";
    },
    suffix: function() {
      return "<" + this.name + "::suffix>";
    },
    process: function(template, path, id) {
      return "[" + id + "::" + template + "]";
    }
  };
};
