var forceArray, socketIdsBy;

require('colors');

socketIdsBy = require('../websocket/subscribe').socketIdsBy;

exports.init = function(store, socketId) {
  return {
    list: function() {
      return store.channels;
    },
    subscribe: function(names, cb) {
      if (cb == null) cb = function() {};
      forceArray(names).forEach(function(name) {
        if (!(store.channels.indexOf(name) >= 0)) {
          store.channels.push(name);
          return console.log('i'.cyan, 'subscribing session id', store.id, 'socket id', socketId, 'to', name);
        }
      });
      this._bindToSocket();
      return store.save(cb);
    },
    unsubscribe: function(names, cb) {
      var _this = this;
      if (cb == null) cb = function() {};
      forceArray(names).forEach(function(name) {
        var i;
        if ((i = store.channels.indexOf(name)) >= 0) {
          store.channels.splice(i, 1);
          return socketIdsBy.channel.remove(name, socketId);
        }
      });
      return store.save(cb);
    },
    reset: function(cb) {
      if (cb == null) cb = function() {};
      return this.unsubscribe(this.list(), cb);
    },
    _bindToSocket: function() {
      return forceArray(store.channels).forEach(function(name) {
        return socketIdsBy.channel.add(name, socketId);
      });
    }
  };
};

forceArray = function(input) {
  return typeof input === 'object' && input || [input];
};
