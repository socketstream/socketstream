"format register";

(function() {
function define(){};  define.amd = {};
function factory() {
  window.jquery = '1';
  return {jquery: '1'};
}
System.register("tree/amd-5a", [], false, function(__require, __exports, __module) {
  return (factory).call(this);
});
})();