// This is used to maintain lists of userIds to socketIds and channelIds to socketIds

exports.UniqueSet = (function() {

  function UniqueSet() {
    this.data = {};
  }

  UniqueSet.prototype.add = function(key, value) {
    var set;
    if (!((key != null) && (value != null))) {
      return false;
    }
    if (set = this.data[key]) {
      if (!(set.indexOf(value) >= 0)) {
        return set.push(value);
      }
    } else {
      return this.data[key] = [value];
    }
  };

  UniqueSet.prototype.remove = function(key, value) {
    var i;
    if (this.data[key] === void 0) {
      return;
    }
    if ((i = this.data[key].indexOf(value)) >= 0) {
      this.data[key].splice(i, 1);
      if (this.data[key].length === 0) {
        return delete this.data[key];
      }
    }
  };

  UniqueSet.prototype.removeFromAll = function(value) {
    var _this = this;
    return this.keys().forEach(function(key) {
      return _this.remove(key, value);
    });
  };

  UniqueSet.prototype.keys = function() {
    return Object.keys(this.data);
  };

  UniqueSet.prototype.members = function(key) {
    return this.data[key] || [];
  };

  return UniqueSet;

})();
