
exports.process = function(code, path) {
  return "(function(require, loadAsync){" + code + "}).call(this, SocketStream.require, SocketStream.loadAsync);";
};
