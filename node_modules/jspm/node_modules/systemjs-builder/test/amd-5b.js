"format register";

(function() {
function define(){};  define.amd = {};
function factory(first) {
  return {
    jquery: '1',
    first: first
  };
}
System.register("tree/amd-5b", ["./first"], false, function(__require, __exports, __module) {
  return (factory).call(this, __require('./first'));
});
})();