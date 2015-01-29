"format register";

function factory() {
  window.jquery = '1';
  return {jquery: '1'};
}
System.register("jquery", [], false, function(__require, __exports, __module) {
  return (factory)();
});
