
exports.process = function(code, path) {
  return "(function(require){" + code + "}).call(this, SocketStream.require);";
};
