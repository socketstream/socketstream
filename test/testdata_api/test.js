exports.actions = function(req, res, ss){

  return {
    doSomething: function(x) {
      return res(x)
    }
  };
};
