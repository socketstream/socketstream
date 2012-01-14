var modPath;

exports.process = function(code, path) {
  return "SocketStream.modules['" + (modPath(path)) + "'] = {mod: function(exports, require){" + code + "}, path: '" + path + "'};";
};

modPath = function(path) {
  var out;
  out = path.split('.');
  out.pop();
  out = out.join();
  return out.split('/').splice(1).join('/');
};
