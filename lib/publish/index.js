var __slice = Array.prototype.slice;

exports.init = function() {
  return {
    transport: require('./transport').init(),
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
          return console.log('➙'.cyan, 'all'.grey, event);
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
          return console.log('➙'.cyan, ("socketId:" + socketId).grey, event);
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
          return console.log('➙'.cyan, ("users:[" + (users.join(',')) + "]").grey, event);
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
          return console.log('➙'.cyan, ("channels:[" + (channels.join(',')) + "]").grey, event);
        }
      };
      methods.broadcast = methods.all;
      methods.channel = methods.channels;
      methods.user = methods.users;
      return methods;
    }
  };
};
