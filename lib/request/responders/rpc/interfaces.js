
exports.init = function(request, messagePrefix) {
  return {
    raw: request,
    websocket: function(msg, meta, socket) {
      var msgLogName, req, res;
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
      res = function(err, response) {
        var obj, timeTaken;
        if (err) {
          obj = {
            id: req.id,
            e: {
              message: err.stack
            }
          };
          console.log('→'.red, msgLogName, req.method, err.message.red);
        } else {
          obj = {
            id: req.id,
            p: response,
            e: req.error
          };
          timeTaken = Date.now() - req.receivedAt;
          console.log('←'.green, msgLogName, req.method, ("(" + timeTaken + "ms)").grey);
        }
        msg = messagePrefix + '|' + JSON.stringify(obj);
        return socket(msg);
      };
      console.log('→'.cyan, msgLogName, req.method);
      return request(req, res);
    },
    internal: function(args, meta, res) {
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
      return request(req, res);
    }
  };
};
