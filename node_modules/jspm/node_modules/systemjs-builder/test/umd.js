"format register";

(function() {
function define(){};  define.amd = {};
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    System.register("tree/umd", ["./cjs"], false, typeof factory == "function" ? factory : function() {
      return factory;
    });
  } else if (typeof exports === 'object') {
    module.exports = factory(require, exports, module);
  } else {
    root.wAnalytics = factory();
  }
}(this, function(require, exports, module) {
  require('./cjs');
  exports.umd = 'detection';
}));
})();