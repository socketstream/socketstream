'use strict';

/**
 * @ngdoc service
 * @name utils.unique_set:UniqueSet
 * @function
 *
 * @description
 * This is used to maintain lists of userIds to socketIds and channelIds to socketIds
 */
exports.UniqueSet = (function() {

  function UniqueSet() {
    this.data = {};
  }

  /**
   * @ngdoc service
   * @name utils.UniqueSet#add
   * @methodOf utils.unique_set:UniqueSet
   * @function
   *
   * @description
   * Add specific `key/value` set
   *
   * @param {String} key   Key name
   * @param {Mixed}  value Value to be assigned to the `key`
   */
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

  /**
   * @ngdoc service
   * @name utils.UniqueSet#remove
   * @methodOf utils.unique_set:UniqueSet
   * @function
   *
   * @description
   * Remove specific `key/value` set
   *
   * @param {String}    key   Key name
   * @param {Mixed}     value Value related to the `key`
   * @return {Boolean}        Remove state
   */
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

  /**
   * @ngdoc service
   * @name utils.UniqueSet#removeFromAll
   * @methodOf utils.unique_set:UniqueSet
   * @function
   *
   * @description
   * Remove all specific `key/value` sets accotding to `value`
   *
   * @param {Mixed}     value Value as a link for removal all the sets
   * @return {Boolean}        Removal status
   */
  UniqueSet.prototype.removeFromAll = function(value) {
    var _this = this;
    return this.keys().forEach(function(key) {
      return _this.remove(key, value);
    });
  };

  /**
   * @ngdoc service
   * @name utils.UniqueSet#keys
   * @methodOf utils.unique_set:UniqueSet
   * @function
   *
   * @description
   * Returns array of keys
   *
   * @return {Array} Array of all the keys names
   */
  UniqueSet.prototype.keys = function() {
    return Object.keys(this.data);
  };

  /**
   * @ngdoc service
   * @name utils.UniqueSet#members
   * @methodOf utils.unique_set:UniqueSet
   * @function
   *
   * @description
   * Returns array with all the values by certain `key`
   *
   * @return {Array}  Array of all the keys for specified `key`
   */
  UniqueSet.prototype.members = function(key) {
    return this.data[key] || [];
  };

  return UniqueSet;

})();
