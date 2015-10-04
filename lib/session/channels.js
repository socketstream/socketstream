// Session Channels
// ----------------
// Provides an interface allowing you to subscribe or unsubscribe the session to a private channel
'use strict';

require('colors');

// Stores the relationship between sessionId and socketIds
var subscriptions = require('../websocket/subscriptions');

module.exports = function(ss, session, socketId) {
  return {

    // Lists all the channels the client is currently subscribed to    
    list: function() {
      return session.channels || [];
    },

    // Subscribes the client to one or more channels    
    subscribe: function(names, cb) {
      if (!cb) {
        cb = function() {};
      }
      if (!session.channels) {
        session.channels = [];
      }
      forceArray(names).forEach(function(name) {
        if (session.channels.indexOf(name) === -1) { // clients can only join a channel once
          session.channels.push(name);
          return ss.log.info('i'.green + ' subscribed sessionId '.grey + session.id + ' to channel '.grey + name);
        }
      });
      this._bindToSocket();
      return session.save(cb);
    },

    // Unsubscribes the client from one or more channels
    unsubscribe: function(names, cb) {
      if (!cb) {
        cb = function() {};
      }
      if (!session.channels) {
        session.channels = [];
      }
      forceArray(names).forEach(function(name) {
        var i;
        if ((i = session.channels.indexOf(name)) >= 0) {
          session.channels.splice(i, 1);
          subscriptions.channel.remove(name, socketId);
          return ss.log.info('i'.green + ' unsubscribed sessionId '.grey + session.id + ' from channel '.grey + name);
        }
      });
      return session.save(cb);
    },

    // Unsubscribes the client from all channels    
    reset: function(cb) {
      if (!cb) {
        cb = function() {};
      }
      return this.unsubscribe(this.list(), cb);
    },
    _bindToSocket: function() {
      if (!session.channels) {
        session.channels = [];
      }
      return forceArray(session.channels).forEach(function(name) {
        return subscriptions.channel.add(name, socketId);
      });
    }
  };
};

// Private

function forceArray(input) {
  return typeof input === 'object' && input.slice() || [input];
}
