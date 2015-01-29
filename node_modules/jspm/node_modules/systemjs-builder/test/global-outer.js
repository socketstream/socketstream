"format register";

System.register("tree/global-outer", [], false, function(__require, __exports, __module) {
  System.get("@@global-helpers").prepareGlobal(__module.id, []);
  (function() {
    (function() {
      p = 6;
    });
    var p = 5;
    this["p"] = p;
  }).call(System.global);
  return System.get("@@global-helpers").retrieveGlobal(__module.id, false);
});
