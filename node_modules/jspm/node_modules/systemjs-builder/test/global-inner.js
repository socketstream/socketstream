"format register";

System.register("tree/global-inner", [], false, function(__require, __exports, __module) {
  System.get("@@global-helpers").prepareGlobal(__module.id, []);
  (function() {
    (function() {
      var p = 5;
    });
    if (true) {
      let q = 5;
    }
    {
      let r = 10;
      var r = 10;
    }
    this["r"] = r;
  }).call(System.global);
  return System.get("@@global-helpers").retrieveGlobal(__module.id, false);
});
