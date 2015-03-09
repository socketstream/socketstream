// Publish Event API
// -----------------
// Allows you to publish events to browser clients. All this code is closely related to the 'event' websocket responder
'use strict';

var isInternal,
  __slice = [].slice,
  log = require('../utils/log');

module.exports = function() {
  return {
    transport: require('./transport')(),

    /**
     * @ngdoc service
     * @name ss.publish:publish
     * @description
     * Extend the internal API with a publish object you can call from your own server-side code
     * @returns {object} API
     */
    api: function(transport) {
      var methods = {

        /**
         * @ngdoc function
         * @name ss.publish#all
         * @methodOf ss.publish:publish
         * @param {string} name Name of the event
         * @param {any} first First parameter (open ended)
         * @description
         * Publish event to all active client browsers
         */
        all: function() {
          var event, obj, params;
          event = arguments[0], params = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          obj = {
            t: 'all',
            e: event,
            p: params
          };
          transport.send(obj);
          if (!isInternal(event)) {
            return log.info('➙'.cyan, 'event:all'.grey, event);
          }
        },
        socketId: function() {
          var event, obj, params, socketId;
          socketId = arguments[0], event = arguments[1], params = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
          obj = {
            t: 'socketId',
            socketId: socketId,
            e: event,
            p: params
          };
          transport.send(obj);
          return log.info('➙'.cyan, ('event:socketId:' + socketId).grey, event);
        },
        users: function() {
          var event, obj, params, users;
          users = arguments[0], event = arguments[1], params = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
          users = users instanceof Array && users || [users];
          obj = {
            t: 'user',
            users: users,
            e: event,
            p: params
          };
          transport.send(obj);
          return log.info('➙'.cyan, ('event:users:[' + (users.join(',')) + ']').grey, event);
        },

          /**
           * @ngdoc function
           * @name ss.publish#channel
           * @methodOf ss.publish:publish
           * @param {string|array} channel Name of the channel(s)
           * @param {string} event Name of the event
           * @param {any} first First parameter (open ended)
           * @description
           * Publish event to all active client browsers in given channel
           */
        channels: function() {
          var channels, event, obj, params;
          channels = arguments[0], event = arguments[1], params = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
          channels = channels instanceof Array && channels || [channels];
          obj = {
            t: 'channel',
            channels: channels,
            e: event,
            p: params
          };
          transport.send(obj);
          return log.info('➙'.cyan, ('event:channels:[' + (channels.join(',')) + ']').grey, event);
        }
      };

      // Alias 0.2 command
      methods.broadcast = methods.all;
      // Alias singles to plurals
      methods.channel = methods.channels;
      methods.user = methods.users;

      // Return all methods
      return methods;
    }
  };
};

// Private

isInternal = function(event) {
  return event.substr(0, 5) === '__ss:';
};
