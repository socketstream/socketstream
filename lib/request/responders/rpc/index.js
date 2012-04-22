var fs;

fs = require('fs');

module.exports = function(responderId, config, ss) {
  var code, name;
  name = config && config.name || 'rpc';
  code = fs.readFileSync(__dirname + '/client.' + (process.env['SS_DEV'] && 'coffee' || 'js'), 'utf8');
  ss.client.send('mod', 'socketstream-rpc', code, {
    coffee: process.env['SS_DEV']
  });
  ss.client.send('code', 'init', "require('socketstream-rpc')(" + responderId + ", {}, require('socketstream').send(" + responderId + "));");
  return {
    name: name,
    interfaces: function(middleware) {
      var request;
      request = require('./request')(ss, middleware);
      return {
        websocket: function(msg, meta, send) {
          var message, msgLogName, obj, req;
          msg = JSON.parse(msg);
          req = {
            id: msg.id,
            method: msg.m,
            params: msg.p,
            socketId: meta.socketId,
            clientIp: meta.clientIp,
            sessionId: meta.sessionId,
            transport: meta.transport,
            receivedAt: Date.now()
          };
          msgLogName = ("rpc:" + req.id).grey;
          ss.log('↪'.cyan, msgLogName, req.method);
          try {
            return request(req, function(err, response) {
              var obj, timeTaken;
              obj = {
                id: req.id,
                p: response,
                e: req.error
              };
              timeTaken = Date.now() - req.receivedAt;
              ss.log('↩'.green, msgLogName, req.method, ("(" + timeTaken + "ms)").grey);
              return send(JSON.stringify(obj));
            });
          } catch (e) {
            message = (meta.clientIp === '127.0.0.1') && e.stack || 'See server-side logs';
            obj = {
              id: req.id,
              e: {
                message: message
              }
            };
            ss.log('↪'.red, msgLogName, req.method, e.message.red);
            return send(JSON.stringify(obj));
          }
        },
        internal: function(args, meta, send) {
          var method, req;
          method = args[0];
          req = {
            id: 'internal',
            method: method,
            params: args.splice(1),
            sessionId: meta.sessionId,
            transport: meta.transport,
            receivedAt: Date.now()
          };
          return request(req, send);
        }
      };
    }
  };
};
