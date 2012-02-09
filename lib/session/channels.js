var forceArray, socketIdsBy;

require('colors');

socketIdsBy = require('../websocket/subscribe').socketIdsBy;

exports.init = function(session, socketId) {
  return {
    list: function() {
      return session.channels || [];
    },
    subscribe: function(names, cb) {
      if (cb == null) cb = function() {};
      if (!session.channels) session.channels = [];
      forceArray(names).forEach(function(name) {
        if (!(session.channels.indexOf(name) >= 0)) {
          session.channels.push(name);
          return console.log('i'.cyan, 'subscribing session id', session.id, 'socket id', socketId, 'to', name);
        }
      });
      this._bindToSocket();
      return session.save(cb);
    },
    unsubscribe: function(names, cb) {
      var _this = this;
      if (cb == null) cb = function() {};
      if (!session.channels) session.channels = [];
      forceArray(names).forEach(function(name) {
        var i;
        if ((i = session.channels.indexOf(name)) >= 0) {
          session.channels.splice(i, 1);
          return socketIdsBy.channel.remove(name, socketId);
        }
      });
      return session.save(cb);
    },
    reset: function(cb) {
      if (cb == null) cb = function() {};
      return this.unsubscribe(this.list(), cb);
    },
    _bindToSocket: function() {
      if (!session.channels) session.channels = [];
      return forceArray(session.channels).forEach(function(name) {
        return socketIdsBy.channel.add(name, socketId);
      });
    }
  };
};

forceArray = function(input) {
  return typeof input === 'object' && input || [input];
};
