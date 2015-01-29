"format register";

(function() {
function define(){};  define.amd = {};
function factory(second) {
  return second;
}
System.register("tree/amd-4", ["./second"], false, function(__require, __exports, __module) {
  return (factory).call(this, __require('./second'));
});
})();