// Publish Event API
// -----------------
// Allows you to publish events to browser clients. All this code is closely related to the 'event' websocket responder

var isInternal,
  __slice = [].slice;

module.exports = function() {
  return {
    transport: require('./transport')(),
    api: function(transport) {
      var methods;
      methods = {
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
            return console.log('➙'.cyan, 'event:all'.grey, event);
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
          return console.log('➙'.cyan, ("event:socketId:" + socketId).grey, event);
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
          return console.log('➙'.cyan, ("event:users:[" + (users.join(',')) + "]").grey, event);
        },
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
          return console.log('➙'.cyan, ("event:channels:[" + (channels.join(',')) + "]").grey, event);
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
