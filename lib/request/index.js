
exports.init = function(root, ss) {
  return {
    responders: require('./responders').init(root, ss)
  };
};
