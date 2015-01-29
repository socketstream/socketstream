"format register";

(function() {
function define(){};  define.amd = {};
System.register("tree/amd-1", ["./first", "./second"], false, function(__require, __exports, __module) {
  return (function(first, second, require, module) {
    module.exports = {
      first: first,
      second: require("./second")
    };
  }).call(this, __require('./first'), __require('./second'), __require, __module);
});
})();